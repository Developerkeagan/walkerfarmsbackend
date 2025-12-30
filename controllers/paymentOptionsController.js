const PaymentOption = require('../models/PaymentOption');

// @desc    Get all payment options
// @route   GET /api/admin/payment-options
// @access  Private/Admin
const getPaymentOptions = async (req, res) => {
  try {
    const paymentOptions = await PaymentOption.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      paymentOptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a payment option
// @route   POST /api/admin/payment-options
// @access  Private/Admin
const createPaymentOption = async (req, res) => {
  try {
    const { name, description, type, cardConfig, bankDetails } = req.body;

    // Check if payment option with this name already exists
    const existingOption = await PaymentOption.findOne({ name });
    if (existingOption) {
      return res.status(400).json({
        success: false,
        message: 'Payment option with this name already exists'
      });
    }

    const paymentOption = new PaymentOption({
      name,
      description,
      type,
      cardConfig: type === 'card' ? cardConfig : undefined,
      bankDetails: type === 'bank_transfer' ? bankDetails : undefined
    });

    const createdOption = await paymentOption.save();

    res.status(201).json({
      success: true,
      paymentOption: createdOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a payment option
// @route   PUT /api/admin/payment-options/:id
// @access  Private/Admin
const updatePaymentOption = async (req, res) => {
  try {
    const { name, description, type, enabled, cardConfig, bankDetails } = req.body;

    const paymentOption = await PaymentOption.findById(req.params.id);

    if (!paymentOption) {
      return res.status(404).json({
        success: false,
        message: 'Payment option not found'
      });
    }

    paymentOption.name = name || paymentOption.name;
    paymentOption.description = description || paymentOption.description;
    paymentOption.type = type || paymentOption.type;
    paymentOption.enabled = enabled !== undefined ? enabled : paymentOption.enabled;

    if (type === 'card' && cardConfig) {
      paymentOption.cardConfig = { ...paymentOption.cardConfig, ...cardConfig };
    }

    if (type === 'bank_transfer' && bankDetails) {
      paymentOption.bankDetails = { ...paymentOption.bankDetails, ...bankDetails };
    }

    const updatedOption = await paymentOption.save();

    res.json({
      success: true,
      paymentOption: updatedOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a payment option
// @route   DELETE /api/admin/payment-options/:id
// @access  Private/Admin
const deletePaymentOption = async (req, res) => {
  try {
    const paymentOption = await PaymentOption.findById(req.params.id);

    if (!paymentOption) {
      return res.status(404).json({
        success: false,
        message: 'Payment option not found'
      });
    }

    await PaymentOption.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Payment option deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle payment option status
// @route   PATCH /api/admin/payment-options/:id/toggle
// @access  Private/Admin
const togglePaymentOption = async (req, res) => {
  try {
    const paymentOption = await PaymentOption.findById(req.params.id);

    if (!paymentOption) {
      return res.status(404).json({
        success: false,
        message: 'Payment option not found'
      });
    }

    paymentOption.enabled = !paymentOption.enabled;
    await paymentOption.save();

    res.json({
      success: true,
      paymentOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getPaymentOptions,
  createPaymentOption,
  updatePaymentOption,
  deletePaymentOption,
  togglePaymentOption
};
