import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Pos.css';
import AddToCartModal from '../UIComponents/AddToCartModal';
import ProductCard from '../UIComponents/ProductCard';
import { ToastSuccess, ToastError } from '../UIComponents/ToastComponent';
import LoadingState from '../UIComponents/LoadingState';
import SalesReminder from '../UIComponents/SalesReminder';

const Pos = () => {
    const [loading, setLoading] = useState(false);
    const cartContainer = useRef();
    const cartIcon = useRef();
    const [isAddToCartModalOpen, setAddToCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartContainerVisible, setCartContainerVisible] = useState(false);
    const [salesReminder, setSalesReminder] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const handleClick = (e) => {
            if(cartContainer.current && !cartContainer.current.contains(e.target)){
                if(cartIcon.current && !cartIcon.current.contains(e.target) ){
                    setCartContainerVisible(false);
                }
            }
        }

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick)
    }, [])

    const getBatchDetails = async (productId, batchNumber) => {
        try {
            const response = await fetch(`${apiUrl}/KampBJ-api/server/getBatchDetails.php?productId=${productId}&batchNumber=${batchNumber}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product batch data');
            }
            const data = await response.json();

            return data;
        } catch (error) {
            console.error('Error fetching product batch data:', error);
            ToastError('Failed to fetch batch details.');
            throw error;
        }
    };
    

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${apiUrl}/KampBJ-api/server/getActiveProducts.php`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
                ToastError('Failed to fetch products.');
            }finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [apiUrl]);

    const toggleAddToCartModal = (product = null) => {
        setSelectedProduct(product);
        setAddToCartOpen(!isAddToCartModalOpen);
    };

    const addToCart = async (product, quantity, batchNumber) => {
        try {
            const batchData = await getBatchDetails(product.productId, batchNumber);
            
            if (!batchData || !batchData[0]) {
                ToastError('Batch details do not include a valid selling price.');
                return;
            }
    
            const availableStock = batchData[0]?.quantity;
            const sellingPrice = batchData[0]?.sellingPrice;
    
            if (!sellingPrice) {
                ToastError('No selling price available for this batch.');
                return;
            }
    
            setCart(prevCart => {
                // Find an existing product with the same productId and batchNumber
                const existingProductIndex = prevCart.findIndex(
                    item => item.productId === product.productId && item.batchNumber === batchNumber
                );
                const existingProduct = prevCart[existingProductIndex];
    
                if (existingProductIndex !== -1) {
                    // Get current total quantity already in cart for this product and batch
                    const currentQuantity = existingProduct.quantity;
                    const newQuantity = currentQuantity + quantity;
    
                    // Check if new total exceeds available stock
                    if (newQuantity > availableStock) {
                        ToastError(`The total quantity entered (${newQuantity}) exceeds the available stock of ${availableStock} for this batch.`);
                        return prevCart; // Prevent update if it exceeds stock
                    }
    
                    // Update the cart with new quantity
                    const updatedCart = [...prevCart];
                    updatedCart[existingProductIndex] = {
                        ...existingProduct,
                        quantity: newQuantity,
                        sellingPrice, // Update selling price if needed
                    };
                    ToastSuccess(`${product.productName} updated in cart!`);
                    return updatedCart;
                } else {
                    // Validate against available stock for a new entry
                    if (quantity > availableStock) {
                        alert(`The quantity entered (${quantity}) exceeds the available stock of ${availableStock} for this batch.`);
                        return prevCart; // Prevent adding if it exceeds stock
                    }
    
                    // Add new product entry
                    const productWithPrice = {
                        ...product,
                        quantity,
                        sellingPrice,
                        batchNumber,
                    };
    
                    ToastSuccess(`${product.productName} added to cart!`);
                    return [...prevCart, productWithPrice];
                }
            });
        } catch (error) {
            console.error('Error in getBatchDetails:', error);
            ToastError('Failed to add product to cart. Please try again.');
        }
    };
    
    const handleCheckout = async () => {
        setSalesReminder(false);

        if(cart.length!=0){
            const orderItems = cart.map(item => ({
                indicator: item.lowStockIndicator,
                productName: item.productName,
                productId: item.productId,
                quantity: item.quantity,
                price: item.sellingPrice,
                total: item.sellingPrice * item.quantity,
                batchNumber : item.batchNumber
            }));
            const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
            const userId = localStorage.getItem('userId');
    
            try {
                const response = await fetch(`${apiUrl}/KampBJ-api/server/processCheckout.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderItems, totalAmount, userId }),
                });
    
                const result = await response.json();
                if (result.success) {
                    ToastSuccess("Order processed successfully!");
                    setCart([]);
                    const productsResponse = await fetch(`${apiUrl}/KampBJ-api/server/getActiveProducts.php`);
                    const productsData = await productsResponse.json();
                    setProducts(productsData);
                } else {
                    ToastError(result.message || "Failed to process order.");
                }
            } catch (error) {
                console.error("Error processing checkout:", error);
                ToastError("Error processing checkout.");
            }
        }else{
            ToastError("Order List is empty!");
        }
       
    };

    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='pos'>
            <div className='pos__header'>
                <div className='pos__search-wrapper'>
                    <input
                        type='text'
                        placeholder='Search'
                        className='pos__input-field'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className='pos__cart-container-icon-wrapper'>
                    {cart.length > 0 && <i className="pos__cart-warning-icon fa-solid fa-circle-exclamation"></i>}
                    <i className="pos__cart-container-icon fa-solid fa-cart-shopping" title='Cart' ref={cartIcon} onClick={() => setCartContainerVisible(true)}></i>
                </div>
            </div>

            <div className='pos__body'>
                <div className='pos__content-wrapper'>
                    <div className='pos__inventory-wrapper'>
                        {filteredProducts.map((product) =>
                            <ProductCard
                                key={product.productId}
                                product={product}
                                icon='fa-arrow-right'
                                onClick={() => toggleAddToCartModal(product)}
                                iconTooltip='Add to cart'
                            />
                        )}
                    </div>
                    
                    <CartComponent 
                        cartComponentClass={isCartContainerVisible ? 'cart-component-active':''} 
                        cart={cart} 
                        setCart={setCart}  
                        cardContainerRef={cartContainer} 
                        openSalesReminder={() => setSalesReminder(true)}
                    />
                </div>

            </div>

            {isAddToCartModalOpen && (
                <AddToCartModal product={selectedProduct} onAddToCart={addToCart} onClick={toggleAddToCartModal} />
            )}

            {salesReminder && <SalesReminder proceed={handleCheckout} cancel={() => setSalesReminder(false)}/>}
            {loading && <LoadingState />}
        </div>
    );
};

export default Pos;



export const CartComponent = ({cartComponentClass, cardContainerRef, cart, setCart, openSalesReminder}) => {
    

    return (
        <div className={`cart-component ${cartComponentClass}`} ref={cardContainerRef}>
            <div className='pos__orders-table-wrapper'>
                <table className='pos__table'>
                    <thead>
                        <tr>
                            <th className='pos__table-th'>Batch No.</th>
                            <th className='pos__table-th'>Name</th>
                            <th className='pos__table-th'>Brand</th>
                            <th className='pos__table-th'>Model</th>
                            <th className='pos__table-th'>Quantity</th>
                            <th className='pos__table-th'>Price</th>
                            <th className='pos__table-th'>Total</th>
                            <th className='pos__table-th'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => (
                            <tr className='pos__table-tr' key={index}>
                                <td className='pos__table-td'>{item.batchNumber}</td>
                                <td className='pos__table-td'>{item.productName}</td>
                                <td className='pos__table-td'>{item.brand}</td>
                                <td className='pos__table-td'>{item.model}</td>
                                <td className='pos__table-td'>{item.quantity}</td>
                                <td className='pos__table-td'>₱ {(item.sellingPrice * 1).toFixed(2)}</td>
                                <td className='pos__table-td'>₱ {(item.sellingPrice * item.quantity).toFixed(2)}</td>
                                <td className='pos__table-td'>
                                    <i className="pos__icon-td fa-solid fa-trash" onClick={(e) => {
                                        e.stopPropagation(); // Prevent the click from closing the cart container
                                        setCart(cart.filter((_, i) => i !== index));
                                    }}></i>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='pos__orders-details'>
                <div className='pos__billing-details-wrapper'>
                    <p className='pos__bill-label'>Sub Total</p>
                    <p className='pos__bill-label'>₱ {cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0).toFixed(2)}</p>
                </div>
                <button className='pos__checkout' onClick={openSalesReminder}>Checkout</button>
            </div>
 
        </div>
    )
}