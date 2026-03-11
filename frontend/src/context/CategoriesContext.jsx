import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios.js" // <-- adjust path to your axios file

export const CatContext = createContext();

export const useCat = () =>{
    return useContext(CatContext);
};

export const CatProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [product, setProduct] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1️⃣ Fetch categories
                const catRes = await api.get("/category");
                setCategories(catRes.data);
               
                // 2️⃣ Fetch subcategories
                const subRes = await api.get("/subcategorie");
                setSubCategories(subRes.data);
               
                // 3️⃣ Save to localStorage (optional)
                const product = await api.get("/productImages")
                setProduct(product.data)
            } catch (error) {
                console.error("Category Context Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return (
        <CatContext.Provider value={{ categories, subCategories, loading , product }}>
            {children}
        </CatContext.Provider>
    );
};
