import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Calendar, Package, Settings, Download, LogOut, Scale, PlusCircle } from 'lucide-react';
import cannaGodzLeaf from './assets/neon-leaf-logo.png';

// WHITELABEL CONFIGURATION - CUSTOMIZE PER BUSINESS
const BRAND_CONFIG = {
    businessId: import.meta.env.VITE_BUSINESS_ID || "canna_godz_001",
    businessName: import.meta.env.VITE_BUSINESS_NAME || "Canna Godz",
    primaryColor: import.meta.env.VITE_PRIMARY_COLOR || "#10b981", // Changed to a green for dispensary vibe
    accentColor: import.meta.env.VITE_ACCENT_COLOR || "#34d399",
    defaultProducts: [
        { id: "p1", name: "Pre-roll (Single)", price: 50.00, type: "unit" },
        { id: "p2", name: "Pre-roll (5-Pack)", price: 200.00, type: "unit" },
        { id: "w1", name: "OG Kush (Flower)", price: 100.00, type: "weight" },
        { id: "w2", name: "Durban Poison (Flower)", price: 90.00, type: "weight" },
        { id: "s1", name: "Papers", price: 20.00, type: "unit" }
    ],
    // Hardcoded credentials (one per business APK)
    credentials: {
        email: import.meta.env.VITE_ADMIN_EMAIL || "admin@cannagodz.com",
        password: import.meta.env.VITE_ADMIN_PASSWORD || "cannagodz2024"
    }
};

export default function SalesTracker() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [sales, setSales] = useState([]);
    const [amount, setAmount] = useState('');
    const [quantity, setQuantity] = useState(1); // Acts as weight for weight-based items
    const [selectedProduct, setSelectedProduct] = useState('');
    const [view, setView] = useState('record');
    const [products, setProducts] = useState(BRAND_CONFIG.defaultProducts);

    // Inventory State
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductType, setNewProductType] = useState('unit'); // 'unit' or 'weight'
    const [showSettings, setShowSettings] = useState(false);

    // Insights Filtering State
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const authStatus = localStorage.getItem(`auth_${BRAND_CONFIG.businessId}`);
                if (authStatus === 'true') {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth check failed', error);
            }
        };
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const loadData = () => {
            try {
                const salesData = localStorage.getItem(`sales_${BRAND_CONFIG.businessId}`);
                if (salesData) {
                    setSales(JSON.parse(salesData));
                }
            } catch (error) {
                console.log('No existing sales data', error);
            }

            try {
                const productsData = localStorage.getItem(`products_${BRAND_CONFIG.businessId}`);
                if (productsData) {
                    const parsedProducts = JSON.parse(productsData);
                    // Migration: Ensure all products have a type
                    const migratedProducts = parsedProducts.map(p => ({
                        ...p,
                        type: p.type || 'unit' // Default to 'unit' if missing
                    }));
                    setProducts(migratedProducts);
                }
            } catch (error) {
                console.log('Using default products', error);
            }
        };

        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const handleLogin = () => {
        setLoginError('');

        if (loginEmail === BRAND_CONFIG.credentials.email &&
            loginPassword === BRAND_CONFIG.credentials.password) {
            setIsAuthenticated(true);
            try {
                localStorage.setItem(`auth_${BRAND_CONFIG.businessId}`, 'true');
            } catch (error) {
                console.error('Could not save auth status', error);
            }
        } else {
            setLoginError('Invalid credentials. This app is registered to a specific business.');
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            setIsAuthenticated(false);
            try {
                localStorage.removeItem(`auth_${BRAND_CONFIG.businessId}`);
            } catch (error) {
                console.error('Logout error', error);
            }
            setLoginEmail('');
            setLoginPassword('');
        }
    };

    const saveSales = (newSales) => {
        try {
            localStorage.setItem(`sales_${BRAND_CONFIG.businessId}`, JSON.stringify(newSales));
        } catch (error) {
            console.error('Error saving sales:', error);
            alert('Error saving data. Storage may be full.');
        }
    };

    const saveProducts = (newProducts) => {
        try {
            localStorage.setItem(`products_${BRAND_CONFIG.businessId}`, JSON.stringify(newProducts));
        } catch (error) {
            console.error('Error saving products:', error);
        }
    };

    const getSelectedProductObj = () => products.find(p => p.id === selectedProduct);

    const handleProductSelect = (e) => {
        const productId = e.target.value;
        setSelectedProduct(productId);

        const product = products.find(p => p.id === productId);
        if (product) {
            // Reset quantity helper to 1 for units, or typical 1g for weight
            const defaultQty = 1;
            setQuantity(defaultQty);
            const total = (product.price * defaultQty).toFixed(2);
            setAmount(total);
        } else {
            setAmount('');
            setQuantity(1);
        }
    };

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        const qty = parseFloat(val);
        setQuantity(val); // Keep as string to allow typing decimals like "0.5"

        const product = getSelectedProductObj();
        if (product && !isNaN(qty)) {
            const total = (product.price * qty).toFixed(2);
            setAmount(total);
        }
    };

    const addSale = () => {
        const qtyNum = parseFloat(quantity);
        if (!amount || parseFloat(amount) <= 0 || !selectedProduct || isNaN(qtyNum) || qtyNum <= 0) return;

        const product = getSelectedProductObj();
        const productName = product ? product.name : 'Unknown Product';
        const unitPrice = product ? product.price : 0;
        const productType = product ? (product.type || 'unit') : 'unit';

        const newSale = {
            id: Date.now(),
            amount: parseFloat(amount),
            item: productName,
            itemId: selectedProduct,
            quantity: qtyNum,
            unitPrice: unitPrice,
            type: productType,
            date: new Date().toISOString()
        };

        const updatedSales = [newSale, ...sales];
        setSales(updatedSales);
        saveSales(updatedSales);
        setAmount('');
        setQuantity(1);
        setSelectedProduct('');
    };

    const addProduct = () => {
        if (!newProductName.trim() || !newProductPrice) return;

        const newId = `custom_${Date.now()}`;
        const newItem = {
            id: newId,
            name: newProductName.trim(),
            price: parseFloat(newProductPrice),
            type: newProductType
        };

        const updatedProducts = [...products, newItem];
        setProducts(updatedProducts);
        saveProducts(updatedProducts);
        setNewProductName('');
        setNewProductPrice('');
        setNewProductType('unit');
    };

    const deleteProduct = (idToDelete) => {
        if (window.confirm('Remove this product from inventory?')) {
            const updatedProducts = products.filter(p => p.id !== idToDelete);
            setProducts(updatedProducts);
            saveProducts(updatedProducts);
        }
    };

    const deleteSale = (id) => {
        const updatedSales = sales.filter(s => s.id !== id);
        setSales(updatedSales);
        saveSales(updatedSales);
    };

    const clearAllData = () => {
        if (window.confirm('Are you sure you want to delete all sales records? This cannot be undone.')) {
            setSales([]);
            try {
                localStorage.removeItem(`sales_${BRAND_CONFIG.businessId}`);
            } catch (error) {
                console.error('Error clearing data:', error);
            }
        }
    };

    const resetProducts = () => {
        if (window.confirm('Reset to default products? This will remove all custom products.')) {
            setProducts(BRAND_CONFIG.defaultProducts);
            saveProducts(BRAND_CONFIG.defaultProducts);
        }
    };

    const exportToCSV = () => {
        if (sales.length === 0) {
            alert('No sales data to export');
            return;
        }

        const csvContent = [
            ['Date', 'Time', 'Product', 'Type', 'Quantity/Weight', 'Unit Price', 'Total Amount'],
            ...sales.map(sale => {
                const date = new Date(sale.date);
                const typeLabel = sale.type === 'weight' ? 'Weight (g)' : 'Unit (qty)';
                return [
                    date.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' }),
                    date.toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' }),
                    sale.item,
                    typeLabel,
                    sale.quantity || 1,
                    (sale.unitPrice || (sale.amount / (sale.quantity || 1))).toFixed(2),
                    sale.amount.toFixed(2)
                ];
            })
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${BRAND_CONFIG.businessName}_sales_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Filtered Sales for Insights
    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const start = filterStartDate ? new Date(filterStartDate) : null;
        const end = filterEndDate ? new Date(filterEndDate) : null;

        if (start) {
            start.setHours(0, 0, 0, 0);
            if (saleDate < start) return false;
        }
        if (end) {
            end.setHours(23, 59, 59, 999);
            if (saleDate > end) return false;
        }
        return true;
    });

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalTransactions = filteredSales.length;
    const averageSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const getZADateString = (date) => new Date(date).toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    const todayStr = getZADateString(new Date());

    // For "Today's Revenue", we still want to show today's data unless the filter is active and doesn't include today?
    // Actually, let's make it more consistent:
    const todaySales = filteredSales.filter(s => getZADateString(s.date) === todayStr);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.amount, 0);

    const topProducts = Object.entries(filteredSales.reduce((acc, sale) => {
        const qty = sale.quantity || 1;
        acc[sale.item] = (acc[sale.item] || 0) + qty;
        return acc;
    }, {}))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const selectedProductObj = getSelectedProductObj();
    const isWeightBased = selectedProductObj?.type === 'weight';

    // LOGIN SCREEN
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-[#111] rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] p-8 border border-white/5">
                        <div className="text-center mb-8">
                            <div className="inline-block mb-4">
                                <img src={cannaGodzLeaf} alt="Canna Godz" className="w-24 h-24 mx-auto" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tighter neon-text">
                                {BRAND_CONFIG.businessName}
                            </h1>
                            <p className="text-green-500/80 text-sm font-medium tracking-wide uppercase">Dispensary Sales Tracking</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Operator ID / Email
                                </label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    placeholder="admin@cannagodz.com"
                                    className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Secure Access Key
                                </label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-600"
                                />
                            </div>

                            {loginError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-xs font-bold text-red-400 text-center uppercase tracking-wide">{loginError}</p>
                                </div>
                            )}

                            <button
                                onClick={handleLogin}
                                className="w-full py-4 rounded-xl font-black text-white uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all"
                                style={{ backgroundColor: BRAND_CONFIG.primaryColor }}
                            >
                                Enter Dashboard
                            </button>
                        </div>

                        <div className="mt-10 text-center">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                Encrypted System • LaunchGremlin
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // MAIN APP
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-[#111] rounded-2xl shadow-sm p-6 mb-6 border border-white/5" style={{ borderTop: `4px solid ${BRAND_CONFIG.primaryColor}` }}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <img src={cannaGodzLeaf} alt="Canna Godz" className="w-12 h-12" />
                            <div>
                                <h1 className="text-2xl font-black text-white mb-0 tracking-tighter neon-text">{BRAND_CONFIG.businessName}</h1>
                                <p className="text-green-500/80 text-xs font-semibold tracking-wider uppercase">Sales Control</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {showSettings && (
                    <div className="bg-[#111] rounded-2xl shadow-sm p-6 mb-6 border border-white/5">
                        <h2 className="text-lg font-semibold text-white mb-4">Inventory Management</h2>

                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="block text-sm font-medium text-gray-400 mb-3">
                                Add New Product
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        placeholder="Product Name"
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        placeholder="Price (R)"
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 rounded-lg border border-white/10 px-2">
                                    <button
                                        onClick={() => setNewProductType('unit')}
                                        className={`flex-1 py-1.5 px-2 text-sm rounded transition-colors ${newProductType === 'unit' ? 'bg-green-500 text-white font-medium' : 'text-gray-500'
                                            }`}
                                    >
                                        Unit
                                    </button>
                                    <button
                                        onClick={() => setNewProductType('weight')}
                                        className={`flex-1 py-1.5 px-2 text-sm rounded transition-colors ${newProductType === 'weight' ? 'bg-green-500 text-white font-medium' : 'text-gray-500'
                                            }`}
                                    >
                                        Weight
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={addProduct}
                                className="w-full py-2 rounded-lg font-medium text-white transition-colors"
                                style={{ backgroundColor: BRAND_CONFIG.primaryColor }}
                            >
                                Add Product
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-400">
                                    Current Inventory ({products.length} items)
                                </label>
                                <button
                                    onClick={resetProducts}
                                    className="text-xs font-bold text-green-500/60 hover:text-green-500 uppercase tracking-wider"
                                >
                                    Reset to defaults
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl bg-black/20">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-4 border-b border-white/5 last:border-b-0"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-bold">{product.name}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${product.type === 'weight' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {product.type === 'weight' ? 'Per Gram' : 'Per Unit'}
                                                </span>
                                            </div>
                                            <span className="text-green-500/80 text-sm font-mono">R {product.price.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="text-red-600 hover:text-red-700 text-sm px-3 py-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={exportToCSV}
                                className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export Backup
                            </button>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-all font-bold text-sm"
                            >
                                Close Settings
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mb-6">
                    <div className={`flex-1 py-3 px-4 rounded-xl font-bold text-center transition-all cursor-pointer ${view === 'record'
                        ? 'text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-[#111] text-gray-500 hover:bg-white/5 border border-white/5'
                        }`}
                        onClick={() => setView('record')}
                        style={view === 'record' ? { backgroundColor: BRAND_CONFIG.primaryColor } : {}}
                    >
                        Record Sale
                    </div>
                    <div className={`flex-1 py-3 px-4 rounded-xl font-bold text-center transition-all cursor-pointer ${view === 'insights'
                        ? 'text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-[#111] text-gray-500 hover:bg-white/5 border border-white/5'
                        }`}
                        onClick={() => setView('insights')}
                        style={view === 'insights' ? { backgroundColor: BRAND_CONFIG.primaryColor } : {}}
                    >
                        Insights
                    </div>
                </div>

                {view === 'record' ? (
                    <div className="space-y-6">
                        <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-green-500" />
                                New Sale
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                        Select Product
                                    </label>
                                    <select
                                        value={selectedProduct}
                                        onChange={handleProductSelect}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                                    >
                                        <option value="">-- Select Product --</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} (R {product.price.toFixed(2)}/{product.type === 'weight' ? 'g' : 'ea'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            {isWeightBased ? 'Weight (grams)' : 'Quantity'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={isWeightBased ? "0.1" : "1"}
                                                step={isWeightBased ? "0.01" : "1"}
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                            {isWeightBased && (
                                                <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                                                    <Scale className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            Total Amount (R)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">R</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addSale()}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-green-500/60 font-bold uppercase tracking-widest px-1">
                                    <span>
                                        {selectedProduct && `Unit Price: R ${selectedProductObj?.price?.toFixed(2)} / ${isWeightBased ? 'gram' : 'unit'}`}
                                    </span>
                                </div>

                                <button
                                    onClick={addSale}
                                    disabled={!selectedProduct || !amount || parseFloat(quantity) <= 0}
                                    className="w-full py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-30 disabled:shadow-none"
                                    style={{ backgroundColor: BRAND_CONFIG.primaryColor }}
                                >
                                    Record Sale
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Recent Sales</h2>
                                {sales.length > 0 && (
                                    <button
                                        onClick={clearAllData}
                                        className="text-sm font-medium text-red-500/80 hover:text-red-500"
                                    >
                                        Clear History
                                    </button>
                                )}
                            </div>
                            {sales.length === 0 ? (
                                <p className="text-gray-600 text-center py-12 font-bold uppercase tracking-widest text-[10px]">No sales recorded in the current session</p>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                    {sales.map((sale) => (
                                        <div
                                            key={sale.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group"
                                        >
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center pr-4">
                                                    <div>
                                                        <p className="font-black text-white tracking-tight">{sale.item}</p>
                                                        <p className="text-[9px] text-gray-500 font-mono uppercase tracking-[0.15em] mt-1.5">
                                                            {new Date(sale.date).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-green-400 text-lg">R {sale.amount.toFixed(2)}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                                            {sale.quantity}{sale.type === 'weight' ? 'g' : 'u'} @ R {sale.unitPrice?.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteSale(sale.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500/50 hover:text-red-500 transition-all"
                                                title="Void Sale"
                                            >
                                                <LogOut className="w-4 h-4 rotate-90" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Date Filter Bar */}
                        <div className="bg-[#111] rounded-2xl shadow-sm p-4 border border-white/5 flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setFilterStartDate('');
                                    setFilterEndDate('');
                                }}
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] transition-all"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl">
                                        <DollarSign className="w-6 h-6 text-green-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Revenue</h3>
                                </div>
                                <p className="text-4xl font-black text-white tracking-tighter">R {totalRevenue.toFixed(2)}</p>
                            </div>

                            <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <ShoppingCart className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Sales</h3>
                                </div>
                                <p className="text-4xl font-black text-white tracking-tighter">{totalTransactions}</p>
                            </div>

                            <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Average Sale</h3>
                                </div>
                                <p className="text-4xl font-black text-white tracking-tighter">R {averageSale.toFixed(2)}</p>
                            </div>

                            <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-orange-500/10 rounded-xl">
                                        <Calendar className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Today's Revenue</h3>
                                </div>
                                <p className="text-4xl font-black text-white tracking-tighter">R {todayRevenue.toFixed(2)}</p>
                                <p className="text-sm text-green-500/60 font-medium mt-1">{todaySales.length} successful sales</p>
                            </div>
                        </div>

                        <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-500/10 rounded-xl">
                                    <Package className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Top Products</h3>
                            </div>
                            {topProducts.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 bg-white/5 rounded-xl border border-white/5">No product data yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {topProducts.map(([product, totalQty], index) => (
                                        <div key={product} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl font-black text-white/20 w-8">0{index + 1}</span>
                                                <span className="font-bold text-white tracking-tight">{product}</span>
                                            </div>
                                            <span className="text-sm font-bold text-green-500/80 bg-green-500/5 px-3 py-1 rounded-full">{isNaN(totalQty) ? 0 : Number(totalQty).toFixed(1).replace(/\.0+$/, '')} Units Sold</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
