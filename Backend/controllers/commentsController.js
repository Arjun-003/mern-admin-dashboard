import comment from "../models/comments.js";
import users from "../models/users.js";

const commentsController = {
    // Create a new comment
    createComment: async (req, res) => {
        try {
            const { comments, userid, productid ,parentCommentId} = req.body;
            if(!comments || !userid || !productid){
                return res.status(400).json({ error: "comments, userid and productid are required" });
            }
            if(parentCommentId){
                const parentComment = await comment.findByPk(parentCommentId);
               
                if(!parentComment){
                    return res.status(400).json({ error: "Invalid parentCommentId" });
                }
            }
            const newComment = await comment.create({ 
                comments,
                 userid,
                  productid,
                  parentCommentId: parentCommentId || null
                });
            res.status(201).json(newComment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get comments for a specific product
    getCommentsByProduct: async (req, res) => {
  try {
    const { productid } = req.params;

    // ✅ Fetch only top-level comments (no parent)
    const commentsData = await comment.findAll({
      where: { productid, parentCommentId: null },
      include: [
        {
          model: users,
          attributes: ["id", "name", "email"], // optional: limit what you return
        },
        {
          model: comment,
          as: "replies", // 👈 include replies
          include: [
            {
              model: users,
              attributes: ["id", "name", "email"],
            },
            {
              // optional deeper nesting: replies of replies
              model: comment,
              as: "replies",
              include: [
                {
                  model: users,
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // newest first
    });

    res.status(200).json(commentsData);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: error.message });
  }
}

    
}

export default commentsController;