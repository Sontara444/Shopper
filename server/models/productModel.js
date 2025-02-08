import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
