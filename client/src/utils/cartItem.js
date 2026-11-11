export const getCartItemKey = (item) =>
  [
    String(item.id ?? item._id),
    item.selectedSize ?? "",
    item.selectedColor ?? "",
    item.selectedStyle ?? "",
  ].join("::");
