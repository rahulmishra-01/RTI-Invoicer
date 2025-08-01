const Invoice = require('../models/Invoice');

exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedInvoice = await Invoice.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json(updatedInvoice);
    } catch (err) {
        res.status(500).json({ message: 'Error updating invoice', error: err.message });
    }
}