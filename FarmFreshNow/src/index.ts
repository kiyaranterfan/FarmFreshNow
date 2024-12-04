import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

/**
 * Kelas `Product` mewakili sayur atau buah yang dapat dipesan melalui aplikasi.
 */
class Product {
  id: string;
  name: string; // Nama produk (misalnya, "Tomat" atau "Apel")
  description: string; // Deskripsi produk
  pricePerUnit: number; // Harga per unit (misalnya, per kg atau per buah)
  imageUrl: string; // URL gambar produk
  availableQuantity: number; // Stok yang tersedia
  farmerName: string; // Nama petani lokal yang menjual produk ini
  createdAt: Date;
  updatedAt: Date | null;
}

const productStorage = StableBTreeMap<string, Product>(0);

const app = express();
app.use(express.json());

/**
 * Endpoint untuk menambahkan produk baru.
 */
app.post("/products", (req, res) => {
  const product: Product = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    updatedAt: null,
    ...req.body,
  };
  productStorage.insert(product.id, product);
  res.json(product);
});

/**
 * Endpoint untuk mendapatkan semua produk.
 */
app.get("/products", (req, res) => {
  res.json(productStorage.values());
});

/**
 * Endpoint untuk mendapatkan detail produk berdasarkan ID.
 */
app.get("/products/:id", (req, res) => {
  const productId = req.params.id;
  const productOpt = productStorage.get(productId);
  if (!productOpt) {
    res.status(404).send(`Produk dengan ID=${productId} tidak ditemukan`);
  } else {
    res.json(productOpt);
  }
});

/**
 * Endpoint untuk memperbarui detail produk.
 */
app.put("/products/:id", (req, res) => {
  const productId = req.params.id;
  const productOpt = productStorage.get(productId);
  if (!productOpt) {
    res
      .status(400)
      .send(
        `Tidak dapat memperbarui produk dengan ID=${productId}. Produk tidak ditemukan.`
      );
  } else {
    const product = productOpt;

    const updatedProduct = {
      ...product,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    productStorage.insert(product.id, updatedProduct);
    res.json(updatedProduct);
  }
});

/**
 * Endpoint untuk menghapus produk.
 */
app.delete("/products/:id", (req, res) => {
  const productId = req.params.id;
  const deletedProduct = productStorage.remove(productId);
  if (!deletedProduct) {
    res
      .status(400)
      .send(
        `Tidak dapat menghapus produk dengan ID=${productId}. Produk tidak ditemukan.`
      );
  } else {
    res.json(deletedProduct);
  }
});

app.listen();

/**
 * Fungsi untuk mendapatkan tanggal saat ini dalam format ICP.
 */
function getCurrentDate() {
  const timestamp = new Number(time());
  return new Date(timestamp.valueOf() / 1000_000);
}
