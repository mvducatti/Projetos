export default function handler(req, res) {
  const brands = [
    { id: "APPLE", name: "Apple" },
    { id: "SAMSUNG", name: "Samsung" }
  ];

  res.status(200).json({
    data: brands,
    message: "OK",
    hasError: false,
    errorDataCollection: [],
    statusCode: 200
  });
}
