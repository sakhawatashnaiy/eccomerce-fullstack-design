"use strict";
/**
 * Users controller.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { readUserById } = require('./users.service');
async function getUserById(req, res) {
    const data = await readUserById(req.params.uid);
    res.status(200).json({ ok: true, data });
}
module.exports = { getUserById };
//# sourceMappingURL=users.controller.js.map