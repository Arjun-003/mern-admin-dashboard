import Users from "./users.js";
import Chat from "./chats.js";
import Category from "./category.js";
import Comments from "./comments.js";
import Messages from "./messages.js";
import Product from "./product.js";
import ProductImage from "./productImage.js";
import SubCategory from "./SubCategory.js";
import Like from "./likeProduct.js";

/* ========= COMMENTS ========= */

Users.hasMany(Comments, { foreignKey: "userid" });
Comments.belongsTo(Users, { foreignKey: "userid" });

Product.hasMany(Comments, { foreignKey: "productid" });
Comments.belongsTo(Product, { foreignKey: "productid" });

Comments.hasMany(Comments, {
  foreignKey: "parentCommentId",
  as: "replies",
});
Comments.belongsTo(Comments, {
  foreignKey: "parentCommentId",
  as: "parent",
});

/* ========= CATEGORY / PRODUCT ========= */

Category.hasMany(SubCategory, { foreignKey: "categoryId" });
SubCategory.belongsTo(Category, { foreignKey: "categoryId" });

Users.hasMany(Product, { foreignKey: "sellerId", as: "userProducts" });
Product.belongsTo(Users, { foreignKey: "sellerId", as: "productUser" });

SubCategory.hasMany(Product, { foreignKey: "SubCategoryId", as: "subCategoryProducts" });
Product.belongsTo(SubCategory, { foreignKey: "SubCategoryId", as: "productSubCategory" });

Category.hasMany(Product, { foreignKey: "categoryId", as: "categoryProducts" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "productCategory" });

Product.hasMany(ProductImage, { foreignKey: "productId", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Like relations
Like.belongsTo(Users, { foreignKey: "userId", as: "user" });
Like.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Product relations
Product.hasMany(Like, { foreignKey: "productId", as: "likes" });

// User relations
Users.hasMany(Like, { foreignKey: "userId", as: "userLikes" });


/* ========= CHAT SYSTEM ========= */

// User → Chat
Users.hasMany(Chat, { foreignKey: "senderId", as: "sentChats", onDelete: 'CASCADE' });
Users.hasMany(Chat, { foreignKey: "receiverId", as: "receivedChats", onDelete: 'CASCADE' });

// Chat → User
Chat.belongsTo(Users, { foreignKey: "senderId", as: "sender", onDelete: 'CASCADE' });
Chat.belongsTo(Users, { foreignKey: "receiverId", as: "receiver", onDelete: 'CASCADE' });

// Chat → Messages
Chat.hasMany(Messages, { foreignKey: "chatId", as: "messages" , onDelete: 'CASCADE'});
Messages.belongsTo(Chat, { foreignKey: "chatId", as: "chat" , onDelete: 'CASCADE'});

Chat.belongsTo(Messages, { foreignKey: "lastMessageId", as: "lastMessage", onDelete: 'CASCADE' });

// User → Messages
Users.hasMany(Messages, { foreignKey: "senderId", as: "sentMessages" , onDelete: 'CASCADE' });
Messages.belongsTo(Users, { foreignKey: "senderId", as: "sender", onDelete: 'CASCADE' });

Users.hasMany(Messages, { foreignKey: "receiverId", as: "receivedMessages", onDelete: 'CASCADE' });
Messages.belongsTo(Users, { foreignKey: "receiverId", as: "receiver" , onDelete: 'CASCADE'});

// Chat → Product
Product.hasMany(Chat, { foreignKey: "productId", as: "chats", onDelete: 'CASCADE' });
Chat.belongsTo(Product, { foreignKey: "productId", as: "product" , onDelete: 'CASCADE'});

// Export all models
export default { Users, Category, SubCategory, Messages, Chat, Product, ProductImage, Comments, Like };
