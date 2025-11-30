import DacLogger from '../util/DacLogger.js';
import Level from '../conf/Level.js';
import User from '../conf/User.js';
import paramSchema from './params-security.json' with { type: "json" };
const LOGGER = new DacLogger("ParameterValidator.js");

/*

PARAMETER VALIDATION RULES :

- Only define rules for parameters you want to validate.
- If a route is not present in the schema, it will return 401 by default.
- Frontend routes (paths not starting with "/api") are skipped automatically.
- Support for Nested JSON Arrays yet to be added !.
- All errors (missing or invalid fields) are returned in one JSON response:
        {
            error: {
                message: "Validation failed",
                missingFields: [...],
                invalidFields: [...]
            }
        }

SUPPORTED PROPERTIES FOR EACH PARAMETER:

1.  required             : boolean (true / false)
2.  type                 : "string", "number", "boolean", "object", "array".
3.  max                  : number (Maximum length for string values)
4.  min                  : number (Minimum length for string values)
5.  maxValue             : number (Maximum numeric value (only for type = "number"))
6.  minValue             : number (Minimum numeric value (only for type = "number"))
7.  regex                : string (Regular expression string that the value must match)
8.  items                : Object (Validation rules for elements inside an array (only if type = "array"))
9.  custom               : string (Name of a custom validator defined in ParameterValidator.CUSTOM_VALIDATORS)
10. skipLastAccess       : boolean (true / false)

*/


class ParameterValidator {

    static PARAM_SCHEMA = paramSchema;

    static CUSTOM_VALIDATORS = {
        IPv4: (value) => {
            return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(value);
        },
        Email: (value) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
    };

    static validate() {
        return (req, res, next) => {
            const path = req.path;
            try {
                if (!path.startsWith("/api")) {
                    LOGGER.log(Level.FINE, `Frontend route detected: ${path} — skipping validation.`);
                    req.body = {};
                    return next();
                }
                if (this.PARAM_SCHEMA[path] !== undefined) {
                    const result = this.validateBySchema(path, req.body, res);
                    if (result !== true) return;
                } else {
                    LOGGER.log(Level.WARNING, `No validation rule defined for path: ${path}`);
                    return res.status(401).json({
                        error: `No validation rule defined for path: ${path}`
                    });
                }
                LOGGER.log(Level.FINE, `Parameter validation passed for path: ${path}`);
                next();
            } catch (err) {
                LOGGER.log(Level.ERROR, `Error in ParameterValidator: ${err.message}`, User.DAC, err);
                return res.status(500).json({ error: "Internal server error" });
            }
        };
    }

    static validateBySchema(path, body, res) {
        const rulesObject = this.PARAM_SCHEMA[path];
        if (!rulesObject) return true;

        const missingFields = [];
        const invalidFields = [];

        for (const key in rulesObject) {
            const rules = rulesObject[key];
            const value = body[key];

            if (rules.required && (value === undefined || value === null || value === "")) {
                missingFields.push(key);
                continue;
            }

            if (value === undefined || value === null) continue;

            if (rules.type) {
                if (rules.type === "array" && !Array.isArray(value)) {
                    invalidFields.push({ field: key, message: `Expected array` });
                    continue;
                } else if (rules.type !== "array" && typeof value !== rules.type) {
                    invalidFields.push({ field: key, message: `Expected ${rules.type}, got ${typeof value}` });
                    continue;
                }
            }

            if (typeof value === "string") {
                if (rules.max !== undefined && value.length > rules.max) {
                    invalidFields.push({ field: key, message: `Length exceeds max ${rules.max}` });
                }
                if (rules.min !== undefined && value.length < rules.min) {
                    invalidFields.push({ field: key, message: `Length below min ${rules.min}` });
                }
            }

            if (typeof value === "number") {
                if (rules.minValue !== undefined && value < rules.minValue) {
                    invalidFields.push({ field: key, message: `Value less than minValue ${rules.minValue}` });
                }
                if (rules.maxValue !== undefined && value > rules.maxValue) {
                    invalidFields.push({ field: key, message: `Value exceeds maxValue ${rules.maxValue}` });
                }
            }

            if (rules.regex) {
                const pattern = new RegExp(rules.regex);
                if (!pattern.test(value)) {
                    invalidFields.push({ field: key, message: `Does not match regex ${rules.regex}` });
                }
            }

            if (rules.type === "array" && rules.items) {
                value.forEach((item, index) => {
                    const itemRules = rules.items;
                    if (itemRules.type && typeof item !== itemRules.type) {
                        invalidFields.push({
                            field: `${key}[${index}]`,
                            message: `Array item expected type ${itemRules.type}, got ${typeof item}`
                        });
                    }
                    if (itemRules.max && typeof item === "string" && item.length > itemRules.max) {
                        invalidFields.push({
                            field: `${key}[${index}]`,
                            message: `Array item length exceeds max ${itemRules.max}`
                        });
                    }
                    if (itemRules.min && typeof item === "string" && item.length < itemRules.min) {
                        invalidFields.push({
                            field: `${key}[${index}]`,
                            message: `Array item length below min ${itemRules.min}`
                        });
                    }
                    if (itemRules.regex && typeof item === "string") {
                        const pattern = new RegExp(itemRules.regex);
                        if (!pattern.test(item)) {
                            invalidFields.push({
                                field: `${key}[${index}]`,
                                message: `Array item does not match regex ${itemRules.regex}`
                            });
                        }
                    }
                    if (itemRules.custom) {
                        const fn = this.CUSTOM_VALIDATORS[itemRules.custom];
                        if (fn && !fn(item)) {
                            invalidFields.push({
                                field: `${key}[${index}]`,
                                message: `Array item custom validation '${itemRules.custom}' failed`
                            });
                        }
                    }
                });
            }
            if (rules.custom) {
                const fn = this.CUSTOM_VALIDATORS[rules.custom];
                if (fn && !fn(value)) {
                    invalidFields.push({
                        field: key,
                        message: `Custom validation '${rules.custom}' failed`
                    });
                }
            }
        }

        if (missingFields.length > 0 || invalidFields.length > 0) {
            LOGGER.log(Level.WARNING, `Validation failed for ${path}. Missing: [${missingFields.join(", ")}], Invalid: [${invalidFields.map(x => x.field).join(", ")}]`);
            return res.status(400).json({error: {message: "Validation failed", missingFields, invalidFields}});
        }

        return true;
    }

}

export default ParameterValidator;
