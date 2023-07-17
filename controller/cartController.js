const User = require("../models/user");
const Product = require("../models/product");
const SellerUser = require("../models/sellerUser");
const CartProduct = require("../models/cart");
const Joi = require("joi");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const SubmitCartProduct = require("../models/cart");
const SubmitProduct = require("../models/submitProduct");
const cartController = {
  async putInCartProducts(req, res, next) {
    try {
      const updateProductSchema = Joi.object({
        usernameId: Joi.string().regex(mongodbIdPattern).required(),
        productId: Joi.string().regex(mongodbIdPattern).required(),
      });
      const { error } = updateProductSchema.validate(req.body);
      if (error) {
        return next(error);
      }
      const { usernameId, productId } = req.body;
      let data;
      try {
        const user = await User.findOne({ _id: usernameId });
        const product = await Product.findOne({ _id: productId });
        const productOwner = await SellerUser.findOne({ _id: product.owner });
        const SubmitProductToRegister = new CartProduct({
          username: user._id,
          product: [product],
          productOwner: productOwner._id,
        });
        data = await SubmitProductToRegister.save();
      } catch (error) {
        return next(error);
      }
      return res.status(201).json({ data: data });
    } catch (error) {
      return next(error);
    }
  },
  async getAllCartProducts(req, res, next) {
    try {
      const updateProductSchema = Joi.object({
        id: Joi.string().regex(mongodbIdPattern).required(),
      });
      const { error } = updateProductSchema.validate(req.params);
      if (error) {
        return next(error);
      }
      let id = req.params.id;
      let cartProducts;

      try {
        cartProducts = await CartProduct.find({ username: id });
        
      } catch (error) {
        return next(error);
      }
      return res.status(200).json({ Products: cartProducts });
    } catch (error) {
      return next(error);
    }
  },
  async buy(req, res, next) {
    try {
      const buyCartSchema = Joi.object({
        country: Joi.string().required(),
        city: Joi.string().required(),
        address: Joi.string().required(),
        zipCode: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        usernameId: Joi.string().regex(mongodbIdPattern).required(),
      });
      const { error } = buyCartSchema.validate(req.body);
      if (error) {
        return next(error);
      }

      const { usernameId, country, city, address, zipCode, phoneNumber } =
        req.body;

      // Get the user's cart products
      let cartProducts;
      let user
      try {
        cartProducts = await CartProduct.find({
          username: usernameId,
        }).populate("productOwner");
        user = await User.findOne({_id:usernameId})
      } catch (error) {
        console.log(error);
        return next(error);
      }

      const orderPromises = cartProducts.map(async (cartProduct) => {
        const { product, productOwner , User} = cartProduct;

        // Create an order record
        const order = new SubmitProduct({
          country,
          city,
          address,
          zipCode,
          phoneNumber,
          username: user,
          product,
          productOwner: productOwner, // Use the owner variable
        });

        try {
          await order.save();
        } catch (error) {
          console.log(error);
          return next(error);
        }

        // Remove the product from the cart
        try {
          await CartProduct.deleteOne({ _id: cartProduct._id });
        } catch (error) {
          console.log(error);
          return next(error);
        }

        return order;
      });

      const orders = await Promise.all(orderPromises);

      return res.status(200).json({ orders });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },async removeCartProduct(req, res, next) {
      try {
        const buyCartSchema = Joi.object({
          
          id: Joi.string().regex(mongodbIdPattern).required(),
        });
        const { error } = buyCartSchema.validate(req.params);
        if (error) {
          return next(error);
        }
        let id = req.params.id
        try {
          await CartProduct.deleteOne({_id:id})
        } catch (error) {
          return next(error)
        }
        return res.status(200).json({message:"successfully Removerd from the cart"})

      } catch (error) {
        return next(error)
      }
  }
    
};
module.exports = cartController;
