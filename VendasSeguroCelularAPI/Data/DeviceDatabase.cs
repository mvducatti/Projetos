using VendasSeguroCelularAPI.Models;

namespace VendasSeguroCelularAPI.Data;

public class DeviceDatabase
{
    private readonly List<Device> _devices;
    private readonly List<Brand> _brands;

    public DeviceDatabase()
    {
        _brands = new List<Brand>
        {
            new Brand { Id = "APPLE", Name = "Apple" },
            new Brand { Id = "SAMSUNG", Name = "Samsung" },
            new Brand { Id = "MOTOROLA", Name = "Motorola" },
            new Brand { Id = "XIAOMI", Name = "Xiaomi" }
        };

        _devices = InitializeDevices();
    }

    public List<Brand> GetBrands() => _brands;

    public List<Device> GetDevicesByBrand(string brand)
    {
        return _devices.Where(d => GetBrandFromModel(d.DeModel) == brand.ToUpper()).ToList();
    }

    public List<Device> GetDevicesByModel(string model)
    {
        return _devices.Where(d => d.DeModel.Equals(model, StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public Device? GetDeviceById(int id)
    {
        return _devices.FirstOrDefault(d => d.IdObjectSmartphone == id);
    }

    private string GetBrandFromModel(string model)
    {
        if (model.StartsWith("IPHONE")) return "APPLE";
        if (model.StartsWith("GALAXY")) return "SAMSUNG";
        if (model.StartsWith("MOTO")) return "MOTOROLA";
        if (model.StartsWith("REDMI") || model.StartsWith("POCO") || model.StartsWith("MI ")) return "XIAOMI";
        return "UNKNOWN";
    }

    private List<Device> InitializeDevices()
    {
        // Sample devices - In production, load from database or configuration
        return new List<Device>
        {
            // APPLE - iPhone 15 Pro Max
            new Device { IdObjectSmartphone = 123, DeModel = "IPHONE 15 PRO MAX", DeMemory = "256 GB", Price = 7599.00M },
            new Device { IdObjectSmartphone = 124, DeModel = "IPHONE 15 PRO MAX", DeMemory = "512 GB", Price = 8799.00M },
            new Device { IdObjectSmartphone = 125, DeModel = "IPHONE 15 PRO MAX", DeMemory = "1 TB", Price = 10199.00M },
            
            // APPLE - iPhone 15 Pro
            new Device { IdObjectSmartphone = 126, DeModel = "IPHONE 15 PRO", DeMemory = "256 GB", Price = 6599.00M },
            new Device { IdObjectSmartphone = 127, DeModel = "IPHONE 15 PRO", DeMemory = "512 GB", Price = 7799.00M },
            new Device { IdObjectSmartphone = 128, DeModel = "IPHONE 15 PRO", DeMemory = "1 TB", Price = 9199.00M },
            
            // APPLE - iPhone 15
            new Device { IdObjectSmartphone = 129, DeModel = "IPHONE 15", DeMemory = "128 GB", Price = 4999.00M },
            new Device { IdObjectSmartphone = 130, DeModel = "IPHONE 15", DeMemory = "256 GB", Price = 5499.00M },
            new Device { IdObjectSmartphone = 131, DeModel = "IPHONE 15", DeMemory = "512 GB", Price = 6499.00M },
            
            // SAMSUNG - Galaxy S24 Ultra
            new Device { IdObjectSmartphone = 535, DeModel = "GALAXY S24 ULTRA", DeMemory = "256 GB", Price = 6999.00M },
            new Device { IdObjectSmartphone = 536, DeModel = "GALAXY S24 ULTRA", DeMemory = "512 GB", Price = 7999.00M },
            new Device { IdObjectSmartphone = 537, DeModel = "GALAXY S24 ULTRA", DeMemory = "1 TB", Price = 8999.00M },
            
            // SAMSUNG - Galaxy S24
            new Device { IdObjectSmartphone = 538, DeModel = "GALAXY S24", DeMemory = "128 GB", Price = 4499.00M },
            new Device { IdObjectSmartphone = 539, DeModel = "GALAXY S24", DeMemory = "256 GB", Price = 4999.00M },
            new Device { IdObjectSmartphone = 540, DeModel = "GALAXY S24", DeMemory = "512 GB", Price = 5999.00M },
            
            // SAMSUNG - Galaxy A55
            new Device { IdObjectSmartphone = 541, DeModel = "GALAXY A55", DeMemory = "128 GB", Price = 1999.00M },
            new Device { IdObjectSmartphone = 542, DeModel = "GALAXY A55", DeMemory = "256 GB", Price = 2299.00M },
            
            // MOTOROLA - Moto Edge 50 Pro
            new Device { IdObjectSmartphone = 585, DeModel = "MOTO EDGE 50 PRO", DeMemory = "256 GB", Price = 3499.00M },
            new Device { IdObjectSmartphone = 586, DeModel = "MOTO EDGE 50 PRO", DeMemory = "512 GB", Price = 3999.00M },
            
            // MOTOROLA - Moto G84
            new Device { IdObjectSmartphone = 486, DeModel = "MOTO G84", DeMemory = "256 GB", Price = 1599.00M },
            
            // MOTOROLA - Moto Razr 50 Ultra
            new Device { IdObjectSmartphone = 1007, DeModel = "MOTO RAZR 50 ULTRA", DeMemory = "512 GB", Price = 5999.00M },
            
            // XIAOMI - Poco F6 Pro
            new Device { IdObjectSmartphone = 1047, DeModel = "POCO F6 PRO", DeMemory = "256 GB", Price = 2499.00M },
            new Device { IdObjectSmartphone = 1048, DeModel = "POCO F6 PRO", DeMemory = "512 GB", Price = 2999.00M },
            new Device { IdObjectSmartphone = 1049, DeModel = "POCO F6 PRO", DeMemory = "1 TB", Price = 3499.00M },
            
            // XIAOMI - Redmi Note 13 Pro
            new Device { IdObjectSmartphone = 572, DeModel = "REDMI NOTE 13 PRO", DeMemory = "256 GB", Price = 1799.00M },
            new Device { IdObjectSmartphone = 573, DeModel = "REDMI NOTE 13 PRO", DeMemory = "512 GB", Price = 2099.00M },
            
            // XIAOMI - Mi 14
            new Device { IdObjectSmartphone = 996, DeModel = "MI 14", DeMemory = "256 GB", Price = 3999.00M },
            new Device { IdObjectSmartphone = 997, DeModel = "MI 14", DeMemory = "512 GB", Price = 4499.00M }
            
            // NOTE: This is a sample database. In production, you would load all 332 devices
            // from the full dataset documented in WHATSAPP_FLOW_GUIDE.md
        };
    }
}
