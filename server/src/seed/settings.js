export const settings = [
  {
    key: "policies",
    value: {
      returns:
        "Items can be returned within 7 days of delivery if unused, with tags intact and original packaging. Sale items are final sale.",
      exchange:
        "Free size/color exchange within 7 days, subject to stock. Customer covers courier for the second exchange onwards.",
      refund:
        "Refunds for COD orders are issued via bank transfer or JazzCash/Easypaisa within 5-7 working days after the returned item passes inspection."
    }
  },
  {
    key: "delivery",
    value: {
      defaultCharges: 250,
      freeAbove: 5000,
      cities: [
        { name: "Lahore", days: 1, charges: 150, sameDay: true },
        { name: "Islamabad", days: 2, charges: 200, sameDay: true },
        { name: "Karachi", days: 3, charges: 250, sameDay: false },
        { name: "Rawalpindi", days: 2, charges: 200, sameDay: true }
      ],
      note: "Nationwide delivery via TCS/Leopards in 3-5 working days. Cash on Delivery available everywhere."
    }
  },
  {
    key: "persona",
    value: {
      brandVoice:
        "You are FashionHub's friendly shopping assistant. Warm, helpful, concise. Mirror the customer's language (English, Urdu, or Roman Urdu). Use Rs for prices. Suggest one relevant upsell when natural, never be pushy.",
      greeting: "Assalam o Alaikum! Welcome to FashionHub. How can I help you today?"
    }
  },
  {
    key: "faq",
    value: [
      {
        q: "Do you offer Cash on Delivery?",
        a: "Yes! COD is available all over Pakistan. You pay when your parcel arrives."
      },
      {
        q: "How can I track my order?",
        a: "Share your order ID (e.g. FH-2026-0001) and we will send you the latest status and tracking number."
      },
      {
        q: "Do you deliver same day?",
        a: "Same-day delivery is available in Lahore, Islamabad and Rawalpindi for orders placed before 2 PM."
      },
      {
        q: "Is there a size chart?",
        a: "Yes, every product page lists available sizes. Tell us your usual size and we will confirm the best fit."
      },
      {
        q: "Do you have sales?",
        a: "We run seasonal and Eid sales with up to 25% off. Selected items are discounted year-round."
      }
    ]
  }
];
