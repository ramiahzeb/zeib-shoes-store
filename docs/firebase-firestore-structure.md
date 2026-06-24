# ZEIB SHOES Firebase Structure

Use Firebase Authentication for user identity and Firestore for storefront data.

## Collections

- `customers/{uid}`
  - `uid`
  - `name`
  - `email`
  - `phone`
  - `address`
  - `createdAt`
  - `updatedAt`

- `products/{productId}`
  - `id`
  - `name`
  - `slug`
  - `category`
  - `price`
  - `oldPrice`
  - `description`
  - `sizes`
  - `colors`
  - `stock`
  - `images`
  - `rating`
  - `reviewCount`
  - `features`
  - `isNew`
  - `createdAt`
  - `updatedAt`

- `reviews/{reviewId}`
  - `productId`
  - `customerUid`
  - `customerName`
  - `customerEmail`
  - `rating`
  - `comment`
  - `approved`
  - `createdAt`

- `wishlist/{uid}`
  - `uid`
  - `email`
  - `productIds`
  - `updatedAt`

- `carts/{uid}`
  - `uid`
  - `email`
  - `items`
  - `updatedAt`

- `orders/{orderId}`
  - `id`
  - `customerUid`
  - `customerEmail`
  - `customer`
  - `items`
  - `order_items`
  - `total`
  - `status`
  - `createdAt`
  - `updatedAt`

## Product Images

Product documents store image references in the `images` array. Use either:

```text
/images/product.jpg
https://example.com/product.jpg
```

Place local files in `public/images`, or use externally hosted image URLs. Firebase Storage is not required.
