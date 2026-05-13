"use strict";
/**
 * Orders controller.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { readOrdersByUser, readAllOrders, readOrderById, readOrderByIdForUser, readOrderTrackingForUser, createOrderForUser, updateOrderById, } = require('./orders.service');
async function listMyOrders(req, res) {
    const data = await readOrdersByUser(req.user.uid);
    res.status(200).json({ ok: true, data });
}
async function createMyOrder(req, res) {
    const data = await createOrderForUser(req.user.uid, req.body);
    res.status(201).json({ ok: true, data });
}
async function getMyOrder(req, res) {
    const data = await readOrderByIdForUser(req.user.uid, req.params.id);
    res.status(200).json({ ok: true, data });
}
async function getMyOrderTracking(req, res) {
    const data = await readOrderTrackingForUser(req.user.uid, req.params.id);
    res.status(200).json({ ok: true, data });
}
async function listAllOrders(req, res) {
    const data = await readAllOrders();
    res.status(200).json({ ok: true, data });
}
async function getOrder(req, res) {
    const data = await readOrderById(req.params.id);
    res.status(200).json({ ok: true, data });
}
async function patchOrder(req, res) {
    const data = await updateOrderById(req.params.id, req.body);
    res.status(200).json({ ok: true, data });
}
module.exports = {
    listMyOrders,
    createMyOrder,
    getMyOrder,
    getMyOrderTracking,
    listAllOrders,
    getOrder,
    patchOrder,
};
