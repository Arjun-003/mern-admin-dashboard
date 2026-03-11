import Like from "../../models/likeProduct.js";
// Like a product
 const LikeObject = { 
   likeProduct: async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const likeData = { productId, userId };
  try {
    const like = await Like.create(likeData);
    res.status(201).json({ message: "Product liked successfully", like });
  }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "You have already liked this product" });
        }
        res.status(500).json({ message: "An error occurred while liking the product", error: error.message });
    }
},
// Unlike a product
 unlikeProduct : async (req, res) => {  
  const { productId } = req.params;
 
  const userId = req.user.id;
 
  try {
    const deletedLike = await Like.destroy({
      where: {
        productId,
        userId,
      },
    });

    if (deletedLike === 0) {
      return res.status(404).json({ message: "Like not found" });
    }
    res.status(200).json({ message: "Product unliked successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while unliking the product", error: error.message });
  }
}
}
export default LikeObject;