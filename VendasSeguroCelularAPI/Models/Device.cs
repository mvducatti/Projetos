namespace VendasSeguroCelularAPI.Models;

public class Device
{
    public int IdObjectSmartphone { get; set; }
    public string DeModel { get; set; } = string.Empty;
    public string DeMemory { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string FormattedPrice { get; set; } = string.Empty;
}

public class DeviceResponse
{
    public bool HasError { get; set; }
    public Device? Data { get; set; }
}

public class DeviceListResponse
{
    public bool HasError { get; set; }
    public List<Device> Data { get; set; } = new();
}
