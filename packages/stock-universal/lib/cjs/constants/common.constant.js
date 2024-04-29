"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleSubVolume = exports.subscriptionPackages = exports.productState = exports.productType = exports.currency = exports.taxTypes = exports.paymentMethod = exports.orderStatus = exports.invStatus = void 0;
/**
 * Array of inventory statuses.
 */
exports.invStatus = [
    'paid',
    'pending',
    'overdue',
    'cancelled'
];
/**
 * Represents the possible order statuses.
 */
exports.orderStatus = [
    {
        name: 'Pending',
        value: 'pending'
    },
    {
        name: 'Paid Not Delivered',
        value: 'paidNotDelivered'
    },
    {
        name: 'Delivered',
        value: 'delivered'
    },
    {
        name: 'Paid And Delivered',
        value: 'paidAndDelivered'
    }
];
/**
 * Payment methods available for selection.
 */
exports.paymentMethod = [
    {
        name: 'Airtel Money',
        value: 'airtelmoney'
    },
    {
        name: 'Mtn Momo',
        value: 'momo'
    },
    {
        name: 'Cash',
        value: 'cash'
    },
    {
        name: 'Cheque',
        value: 'cheque'
    },
    {
        name: 'Credit',
        value: 'credit'
    }
];
/**
 * Represents the tax types.
 */
exports.taxTypes = [
    {
        name: 'VAT',
        val: 'vat'
    },
    {
        name: 'Income',
        val: 'income'
    }
];
/**
 * Represents an array of currency objects.
 */
exports.currency = [
    /** {
    name: 'US Dollars',
    value: 'USD'
  },*/
    {
        name: 'Uganda Shillings',
        value: 'UGX'
    }
];
/**
 * Represents the list of product types.
 */
exports.productType = [
    {
        name: 'laptop',
        value: 'laptop'
    },
    {
        name: 'desktop',
        value: 'desktop'
    },
    {
        name: 'accessory',
        value: 'accessory'
    },
    {
        name: 'clothings',
        value: 'clothings'
    },
    {
        name: 'phone',
        value: 'phone'
    },
    {
        name: 'tablet',
        value: 'tablet'
    },
    {
        name: 'camera',
        value: 'camera'
    },
    {
        name: 'printer',
        value: 'printer'
    },
    {
        name: 'scanner',
        value: 'scanner'
    },
    {
        name: 'projector',
        value: 'projector'
    },
    {
        name: 'television',
        value: 'television'
    },
    {
        name: 'networking',
        value: 'networking'
    },
    {
        name: 'server',
        value: 'server'
    },
    {
        name: 'storage',
        value: 'storage'
    },
    {
        name: 'software',
        value: 'software'
    },
    {
        name: 'other',
        value: 'other'
    },
    {
        name: 'furniture',
        value: 'furniture'
    },
    {
        name: 'electronics',
        value: 'electronics'
    },
    {
        name: 'appliances',
        value: 'appliances'
    }
];
/**
 * Represents the state of a product.
 */
exports.productState = [{
        name: 'new',
        refurbished: 'new'
    },
    {
        name: 'refurbished',
        value: 'refurbished'
    }
];
exports.subscriptionPackages = [
    {
        name: 'Basic',
        ammount: 50,
        duration: 1,
        features: [
            {
                type: 'item',
                name: 'Items',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'invoice',
                name: 'Invoices',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'quotation',
                name: 'Quotations',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'receipt',
                name: 'Receipts',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'customer',
                name: 'Customers',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'staff',
                name: 'Staffs',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'decoy',
                name: 'Item Decoys',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'offer',
                name: 'Item Offers',
                limitSize: 50,
                remainingSize: 50
            },
            {
                type: 'expense',
                name: 'Expenses',
                limitSize: 50,
                remainingSize: 50
            }
        ]
    },
    {
        name: 'Standard',
        ammount: 100,
        duration: 1,
        features: [
            {
                type: 'item',
                name: 'Items',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'invoice',
                name: 'Invoices',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'quotation',
                name: 'Quotations',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'receipt',
                name: 'Receipts',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'customer',
                name: 'Customers',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'staff',
                name: 'Staffs',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'decoy',
                name: 'Item Decoys',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'offer',
                name: 'Item Offers',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'expense',
                name: 'Expenses',
                limitSize: 150,
                remainingSize: 150
            },
            {
                type: 'web-hosting',
                name: 'Hosted Sites',
                limitSize: 3,
                remainingSize: 3
            },
            {
                type: 'mail-hosting',
                name: 'User Mails',
                limitSize: 3,
                remainingSize: 3
            }
        ]
    },
    {
        name: 'Advanced',
        ammount: 300,
        duration: 1,
        features: [
            {
                type: 'item',
                name: 'Items',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'invoice',
                name: 'Invoices',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'quotation',
                name: 'Quotations',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'receipt',
                name: 'Receipts',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'customer',
                name: 'Customers',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'staff',
                name: 'Staffs',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'decoy',
                name: 'Item Decoys',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'offer',
                name: 'Item Offers',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'expense',
                name: 'Expenses',
                limitSize: 400,
                remainingSize: 400
            },
            {
                type: 'web-hosting',
                name: 'Hosted Sites',
                limitSize: 5,
                remainingSize: 5
            },
            {
                type: 'mail-hosting',
                name: 'User Mails',
                limitSize: 50,
                remainingSize: 50
            }
        ]
    }
];
exports.moduleSubVolume = [
    {
        type: 'item',
        name: 'Items',
        limitSize: 0
    },
    {
        type: 'invoice',
        name: 'Invoices',
        limitSize: 0
    },
    {
        type: 'quotation',
        name: 'Quotations',
        limitSize: 0
    },
    {
        type: 'receipt',
        name: 'Receipts',
        limitSize: 0
    },
    {
        type: 'customer',
        name: 'Customers',
        limitSize: 0
    },
    {
        type: 'staff',
        name: 'Staffs',
        limitSize: 0
    },
    {
        type: 'decoy',
        name: 'Item Decoys',
        limitSize: 0
    },
    {
        type: 'offer',
        name: 'Item Offers',
        limitSize: 0
    },
    {
        type: 'expense',
        name: 'Expenses',
        limitSize: 0
    }
];
//# sourceMappingURL=common.constant.js.map