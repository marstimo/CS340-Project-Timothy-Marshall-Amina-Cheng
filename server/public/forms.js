/*
ManaVault Inventory Manager - CS340 Portfolio Project
Team: Amina Cheng, Timothy Marshall

Citation / Originality Statement:
This client-side helper file was developed by the team for the CS340 portfolio project.
It was written to support form auto-population, default values, and UI consistency.
AI tools were used for brainstorming and syntax cleanup.
*/

document.addEventListener('DOMContentLoaded', () => {
    function byId(id) {
        return document.getElementById(id);
    }

    function setValue(id, value) {
        const el = byId(id);
        if (el) el.value = value ?? '';
    }

    function findById(data, key, value) {
        return Array.isArray(data) ? data.find(item => String(item[key]) === String(value)) : null;
    }

    function updateAmount(priceId, qtyId, amountId) {
        const price = parseFloat(byId(priceId)?.value || 0);
        const qty = parseInt(byId(qtyId)?.value || 0, 10);
        const amountField = byId(amountId);
        if (amountField) {
            amountField.value = (price * qty).toFixed(2);
        }
    }

    // Customers
    if (byId('update_customer_id') && window.customerData) {
        byId('update_customer_id').addEventListener('change', function () {
            const row = findById(window.customerData, 'customerID', this.value);
            if (!row) return;

            setValue('update_customer_firstName', row.firstName);
            setValue('update_customer_lastName', row.lastName);
            setValue('update_customer_email', row.email);
            setValue('update_customer_phoneNumber', row.phoneNumber);
            setValue('update_customer_address1', row.address1);
            setValue('update_customer_address2', row.address2);
            setValue('update_customer_city', row.city);
            setValue('update_customer_state', row.state);
            setValue('update_customer_zipCode', row.zipCode);
        });
    }

    // Sets
    if (byId('update_set_id') && window.setData) {
        byId('update_set_id').addEventListener('change', function () {
            const row = findById(window.setData, 'setID', this.value);
            if (!row) return;

            setValue('update_set_name', row.name);
            setValue('update_set_description', row.description);
            setValue('update_set_releaseDate', row.releaseDate);
        });
    }

    // Products
    if (byId('update_product_id') && window.productData) {
        byId('update_product_id').addEventListener('change', function () {
            const row = findById(window.productData, 'productID', this.value);
            if (!row) return;

            setValue('update_product_type', row.productType);
            setValue('update_product_set_id', row.setID);
            setValue('update_product_name', row.name);
            setValue('update_product_condition', row.cardCondition);
            setValue('update_product_sku', row.sku);
            setValue('update_product_price', row.price);
            setValue('update_product_quantity', row.quantity);
        });
    }

    // Orders
    if (byId('update_order_id') && window.orderData) {
        byId('update_order_id').addEventListener('change', function () {
            const row = findById(window.orderData, 'orderID', this.value);
            if (!row) return;

            setValue('update_order_customer_id', row.customerID);
            setValue('update_order_date', row.orderDateInput);
            setValue('update_order_status', row.orderStatus);
            setValue('update_order_grand_total', row.grandTotal);
        });
    }

    // Payments
    if (byId('update_payment_id') && window.paymentData) {
        byId('update_payment_id').addEventListener('change', function () {
            const row = findById(window.paymentData, 'paymentID', this.value);
            if (!row) return;

            setValue('update_payment_order_id', row.orderID);
            setValue('update_payment_number', row.paymentNumber);
            setValue('update_payment_method', row.paymentMethod);
            setValue('update_payment_amount', row.amount);
            setValue('update_payment_date', row.paymentDateInput);
        });
    }

    // Create Order Item: default product price + auto total
    if (byId('create_order_item_product_id') && window.productPriceData) {
        byId('create_order_item_product_id').addEventListener('change', function () {
            const row = findById(window.productPriceData, 'productID', this.value);
            if (!row) return;

            setValue('create_order_item_unit_price', row.price);
            updateAmount('create_order_item_unit_price', 'create_order_item_quantity', 'create_order_item_amount');
        });
    }

    if (byId('create_order_item_quantity')) {
        byId('create_order_item_quantity').addEventListener('input', function () {
            updateAmount('create_order_item_unit_price', 'create_order_item_quantity', 'create_order_item_amount');
        });
    }

    if (byId('create_order_item_unit_price')) {
        byId('create_order_item_unit_price').addEventListener('input', function () {
            updateAmount('create_order_item_unit_price', 'create_order_item_quantity', 'create_order_item_amount');
        });
    }

    // Update Order Item: prepopulate and auto total
    if (byId('update_order_item_id') && window.orderItemData) {
        byId('update_order_item_id').addEventListener('change', function () {
            const row = findById(window.orderItemData, 'orderItemID', this.value);
            if (!row) return;

            setValue('update_order_item_order_id', row.orderID);
            setValue('update_order_item_product_id', row.productID);
            setValue('update_order_item_unit_price', row.unitPrice);
            setValue('update_order_item_quantity', row.quantity);
            setValue('update_order_item_amount', row.amount);
        });
    }

    if (byId('update_order_item_product_id') && window.productPriceData) {
        byId('update_order_item_product_id').addEventListener('change', function () {
            const row = findById(window.productPriceData, 'productID', this.value);
            if (!row) return;

            setValue('update_order_item_unit_price', row.price);
            updateAmount('update_order_item_unit_price', 'update_order_item_quantity', 'update_order_item_amount');
        });
    }

    if (byId('update_order_item_quantity')) {
        byId('update_order_item_quantity').addEventListener('input', function () {
            updateAmount('update_order_item_unit_price', 'update_order_item_quantity', 'update_order_item_amount');
        });
    }

    if (byId('update_order_item_unit_price')) {
        byId('update_order_item_unit_price').addEventListener('input', function () {
            updateAmount('update_order_item_unit_price', 'update_order_item_quantity', 'update_order_item_amount');
        });
    }
});