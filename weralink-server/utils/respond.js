/**
 * @param {import('express').Response} res
 * @param {number} status 
 * @param {object|null} data 
 * @param {object|null} meta 
 * @param {Array|null} errors 
 */
export const respond = (res, status, data, meta = null, errors = null) => {
    return res.status(status).json({ data, meta, errors });
};
