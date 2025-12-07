using VendasSeguroCelularAPI.Data;
using VendasSeguroCelularAPI.Models;

namespace VendasSeguroCelularAPI.Services;

public class DeviceService
{
    private readonly DeviceDatabase _database;

    public DeviceService()
    {
        _database = new DeviceDatabase();
    }

    public List<Brand> GetBrands()
    {
        return _database.GetBrands();
    }

    public List<Device> GetModels(string brand)
    {
        var devices = _database.GetDevicesByBrand(brand);
        
        // Remove duplicates by DeModel
        var uniqueModels = devices
            .GroupBy(d => d.DeModel)
            .Select(g => g.First())
            .ToList();

        return uniqueModels;
    }

    public List<Device> GetMemoryOptions(string model)
    {
        return _database.GetDevicesByModel(model);
    }

    public Device? GetDeviceById(int id)
    {
        var device = _database.GetDeviceById(id);
        
        if (device != null)
        {
            // Format price
            device.FormattedPrice = device.Price.ToString("C", new System.Globalization.CultureInfo("pt-BR"));
        }

        return device;
    }
}
