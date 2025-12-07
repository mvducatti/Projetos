namespace VendasSeguroCelularAPI.Models;

public class Brand
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class BrandResponse
{
    public bool HasError { get; set; }
    public List<Brand> Data { get; set; } = new();
}
