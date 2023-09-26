import express from "express"
import  fs  from 'fs'
import  path  from 'path'

const app = express()


class ProductManager{
    //GlobalVars//
    static lastId = 0;
    static products = []
    static path = './json/productosDesafio3.json'

    constructor(path){
        //camino para el archivo de usuarios
        this.path = path
        
    }

    //functions//
    addProduct(title, description, price, thumbnail, code, stock) {
        // Validar que todos los campos sean obligatorios
        if (!title || !description || !price || !thumbnail || !stock || !code) {
            throw new Error("Todos los campos son obligatorios.");
        }
        //cargar los productos existentes hasta el momento 
        this.loadProducts()
        // Validar que "code" no se repita en el nuevo producto
        const codeExists = ProductManager.products.some((product) => product.code === code);
        if (codeExists) {
            console.log("El código del producto ya existe");
            return; // No devuelve nada en este caso
        }
        //si el codigo ingresado no existe...
        // Incrementar el lastId para el nuevo producto
        const ultimoId = ProductManager.products.length > 0 ? ProductManager.products[ProductManager.products.length - 1].id : 0;
        ProductManager.lastId = ultimoId + 1;

        // Crear un nuevo producto con un id autoincrementable
        const newProduct = {
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            id: ProductManager.lastId
        };

        // Agregar el nuevo producto al arreglo de productos
        ProductManager.products.push(newProduct);
        this.updateProducts();
        return newProduct; // Devuelve el nuevo producto
        
    }
    
    
    //obtener los productos desde el json
    loadProducts() {
        // Intenta cargar los productos existentes
        try {
            ProductManager.products = JSON.parse(fs.readFileSync(ProductManager.path, 'utf-8')) || [];
            return ProductManager.products;
        } catch (error) {
            // Si se produce un error, verifica si es porque la carpeta no existe
            if (error.code === 'ENOENT') {
                // La carpeta no existe, así que la creamos
                fs.mkdirSync(path.dirname(ProductManager.path), { recursive: true });
                // Luego intentamos cargar los productos nuevamente
                ProductManager.products = [];
                return [];
            } else {
                // Si es un error diferente, muestra el error en la consola
                console.error('Error al cargar productos:', error);
                ProductManager.products = [];
                return [];
            }
        }
    }
    
    updateProduct(searchedId, value, data) {
        const product = ProductManager.products.find((product) => product.id === searchedId);
        const codeExists = ProductManager.products.some((product) => product.code === data);
            if (codeExists) {
                return console.log('No se pudo actualizar el producto > existe otro producto con el mismo codigo!')
            }
            if (product?.[value]) {
                product[value] = data;
                    console.log('Se actualizó el producto correctamente');
                    this.updateProducts();
                    return product;
                    } 
            else {
                    console.log("Producto no encontrado o propiedad inválida. Debe ser uno de: 'title', 'description', 'price', 'thumbnail', 'code', 'stock'");
            }
    }

    getProducts(){
        this.loadProducts()
        return ProductManager.products
    }

    updateProducts(){
        //guardado del array productos en el archivo json
        fs.writeFileSync(ProductManager.path, JSON.stringify(ProductManager.products, null, 2), 'utf-8')
    }

    getProductById(searchedID) {
         // Busca en el arreglo el producto que coincida con el id
        // En caso de no coincidir ningún id, mostrar en consola un error “Not found”
        const product = ProductManager.products.find((product) => product.id === searchedID);
        if (product) {
            return product;
        } else {
            throw new Error("Producto no encontrado");
        }
    }

    deleteProduct(idToDelete) {
        //se verifica que esten cargados los productos actualizados
        this.getProducts()
        // Buscar el índice del producto con el ID especificado
        const indexToDelete = ProductManager.products.findIndex((product) => product.id === idToDelete);
    
        if (indexToDelete !== -1) {
            // Si se encuentra el producto, eliminarlo del arreglo
            ProductManager.products.splice(indexToDelete, 1);
            this.updateProducts();
            return console.log(`Producto con ID ${idToDelete} eliminado exitosamente.`);
        } else {
            console.log(`Producto con ID ${idToDelete} no encontrado.`);
        }
    }
    
}


// Utilizacion
// Creacion del manager
let manager = new ProductManager('json/productosDesafio2.json');
    // manager.addProduct("Producto 1", "Descripción del producto 1", 1500, "imagen1.jpg","282a12g1asd" ,10);
    // manager.addProduct("Producto 2", "Descripción del producto 2", 2900, "imagen2.jpg","52321a2gasd" ,15);
    // manager.addProduct("Producto 2", "Descripción del producto 2", 2900, "imagen2.jpg","52g213aasd" ,15);
    // manager.addProduct("Producto 2", "Descripción del producto 2", 2900, "imagen2.jpg","65g2271aasd" ,15);
    // console.log(manager.getProducts());
    // manager.updateProduct(2, "code", '282a12g1asd')
    // manager.deleteProduct(1)







//----------------------------------------------------------------------------------------------------------
app.get('/',(req,res)=>{
    res.send('Hola mundo')
})
// products con un id a buscar 
app.get('/products/:pid',(req,res)=>{
    let pID = req.params.pid
    if (pID) {
        const product = ProductManager.products.find((product) => product.id == pID);
        if (product) {
            res.send(product);
        } else {
            res.send("Producto no encontrado o parametro no valido");
        }
    }
})

//   /products con limite de productos 
app.get('/products',(req,res)=>{
    let limit = req.query.limit
    let ProductManagerProducts = ProductManager.products
    
    if (limit) {
        if (limit < 0 || limit == 0) {
            res.send("El numero ingresado por parametro no es valido")
        } 
        else{
            if (limit < ProductManagerProducts.length) {
                let newArray = []
                for (let index = 0; index < limit; index++) {
                    newArray.push(ProductManagerProducts[index]);
                }
                res.send(newArray)   
            }
            else{
                // limit < length de productos
                res.send(manager.getProducts())   
            }
        }
    }   
    else{
        //devolver todos los productos
        res.send(manager.getProducts())
    }

})


app.listen('8080',()=>{
    console.log('server activo')
})