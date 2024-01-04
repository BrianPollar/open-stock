
/**
 * Array of inventory statuses.
 */
export const invStatus = [
  'paid',
  'pending',
  'overdue',
  'cancelled'
];

/**
 * Represents the possible order statuses.
 */
export const orderStatus = [
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
export const paymentMethod = [
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
export const taxTypes = [
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
export const currency = [
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
export const productType = [
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
export const productState = [{
  name: 'new',
  refurbished: 'new'
},
{
  name: 'refurbished',
  value: 'refurbished'
}
];


