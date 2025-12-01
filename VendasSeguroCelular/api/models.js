export default function handler(req, res) {
  const { brand } = req.query;

  if (!brand) {
    return res.status(400).json({
      data: [],
      message: "Brand parameter is required",
      hasError: true,
      errorDataCollection: ["Missing brand parameter"],
      statusCode: 400
    });
  }

  const appleModels = [
    { IdObjectSmartphone: 1024, DeFamilyModel: "IPHONE 16", DeModel: "IPHONE 16 PRO" },
    { IdObjectSmartphone: 1027, DeFamilyModel: "IPHONE 16", DeModel: "IPHONE 16 PRO MAX" },
    { IdObjectSmartphone: 1156, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17 PRO" },
    { IdObjectSmartphone: 1159, DeFamilyModel: "IPHONE AIR", DeModel: "IPHONE AIR" },
    { IdObjectSmartphone: 1162, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17 PRO MAX" },
    { IdObjectSmartphone: 239, DeFamilyModel: "IPHONE 13", DeModel: "IPHONE 13 PRO" },
    { IdObjectSmartphone: 243, DeFamilyModel: "IPHONE 13", DeModel: "IPHONE 13 PRO MAX" },
    { IdObjectSmartphone: 341, DeFamilyModel: "IPHONE 14", DeModel: "IPHONE 14 PRO" },
    { IdObjectSmartphone: 345, DeFamilyModel: "IPHONE 14", DeModel: "IPHONE 14 PRO MAX" },
    { IdObjectSmartphone: 467, DeFamilyModel: "IPHONE 15", DeModel: "IPHONE 15 PRO" },
    { IdObjectSmartphone: 470, DeFamilyModel: "IPHONE 15", DeModel: "IPHONE 15 PRO MAX" },
    { IdObjectSmartphone: 337, DeFamilyModel: "IPHONE 14", DeModel: "IPHONE 14 PLUS" },
    { IdObjectSmartphone: 342, DeFamilyModel: "IPHONE 14", DeModel: "IPHONE 14 PRO MAX" },
    { IdObjectSmartphone: 461, DeFamilyModel: "IPHONE 15", DeModel: "IPHONE 15 PLUS" },
    { IdObjectSmartphone: 464, DeFamilyModel: "IPHONE 15", DeModel: "IPHONE 15 PRO" },
    { IdObjectSmartphone: 471, DeFamilyModel: "IPHONE 15", DeModel: "IPHONE 15" },
    { IdObjectSmartphone: 1015, DeFamilyModel: "IPHONE 16", DeModel: "IPHONE 16" },
    { IdObjectSmartphone: 1018, DeFamilyModel: "IPHONE 16", DeModel: "IPHONE 16 PLUS" },
    { IdObjectSmartphone: 1021, DeFamilyModel: "IPHONE 16", DeModel: "IPHONE 16 PRO" },
    { IdObjectSmartphone: 1084, DeFamilyModel: "IPHONE 16", DeModel: "IPHONE 16E" },
    { IdObjectSmartphone: 212, DeFamilyModel: "IPHONE 11", DeModel: "IPHONE 11" },
    { IdObjectSmartphone: 220, DeFamilyModel: "IPHONE 12", DeModel: "IPHONE 12" },
    { IdObjectSmartphone: 223, DeFamilyModel: "IPHONE 12", DeModel: "IPHONE 12 MINI" },
    { IdObjectSmartphone: 226, DeFamilyModel: "IPHONE 12", DeModel: "IPHONE 12 PRO" },
    { IdObjectSmartphone: 229, DeFamilyModel: "IPHONE 12", DeModel: "IPHONE 12 PRO MAX" },
    { IdObjectSmartphone: 232, DeFamilyModel: "IPHONE 13", DeModel: "IPHONE 13" },
    { IdObjectSmartphone: 235, DeFamilyModel: "IPHONE 13", DeModel: "IPHONE 13 MINI" },
    { IdObjectSmartphone: 238, DeFamilyModel: "IPHONE 13", DeModel: "IPHONE 13 PRO" },
    { IdObjectSmartphone: 242, DeFamilyModel: "IPHONE 13", DeModel: "IPHONE 13 PRO MAX" },
    { IdObjectSmartphone: 332, DeFamilyModel: "IPHONE 14", DeModel: "IPHONE 14" },
    { IdObjectSmartphone: 334, DeFamilyModel: "IPHONE 14", DeModel: "IPHONE 14 PRO" },
    { IdObjectSmartphone: 1163, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17 PRO MAX" },
    { IdObjectSmartphone: 1152, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17" },
    { IdObjectSmartphone: 1154, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17 PRO" },
    { IdObjectSmartphone: 1157, DeFamilyModel: "IPHONE AIR", DeModel: "IPHONE AIR" },
    { IdObjectSmartphone: 1160, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17 PRO MAX" },
    { IdObjectSmartphone: 1153, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17" },
    { IdObjectSmartphone: 1155, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17 PRO" },
    { IdObjectSmartphone: 1158, DeFamilyModel: "IPHONE AIR", DeModel: "IPHONE AIR" },
    { IdObjectSmartphone: 1161, DeFamilyModel: "IPHONE 17", DeModel: "IPHONE 17 PRO MAX" }
  ];

  const samsungModels = [
    { IdObjectSmartphone: 535, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S24 ULTRA" },
    { IdObjectSmartphone: 1060, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FOLD 5" },
    { IdObjectSmartphone: 1061, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FOLD 4" },
    { IdObjectSmartphone: 1078, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S25 ULTRA" },
    { IdObjectSmartphone: 1143, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FOLD 7" },
    { IdObjectSmartphone: 412, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S23 ULTRA" },
    { IdObjectSmartphone: 522, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S23" },
    { IdObjectSmartphone: 368, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FLIP 4" },
    { IdObjectSmartphone: 376, DeFamilyModel: "GALAXY M", DeModel: "GALAXY M53" },
    { IdObjectSmartphone: 377, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S9 PLUS" },
    { IdObjectSmartphone: 408, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S22 PLUS" },
    { IdObjectSmartphone: 413, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A54" },
    { IdObjectSmartphone: 415, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S23" },
    { IdObjectSmartphone: 450, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A34" },
    { IdObjectSmartphone: 484, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A24" },
    { IdObjectSmartphone: 494, DeFamilyModel: "GALAXY M", DeModel: "GALAXY M34" },
    { IdObjectSmartphone: 497, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S23 FE" },
    { IdObjectSmartphone: 544, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S24" },
    { IdObjectSmartphone: 568, DeFamilyModel: "GALAXY M", DeModel: "GALAXY M54" },
    { IdObjectSmartphone: 579, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A55" },
    { IdObjectSmartphone: 957, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A15" },
    { IdObjectSmartphone: 959, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A05S" },
    { IdObjectSmartphone: 976, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A35" },
    { IdObjectSmartphone: 983, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A25" },
    { IdObjectSmartphone: 989, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S22 ULTRA" },
    { IdObjectSmartphone: 1031, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A06" },
    { IdObjectSmartphone: 1055, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A16" },
    { IdObjectSmartphone: 1057, DeFamilyModel: "GALAXY M", DeModel: "GALAXY M15" },
    { IdObjectSmartphone: 1092, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S24 FE" },
    { IdObjectSmartphone: 1097, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A36" },
    { IdObjectSmartphone: 1099, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S25" },
    { IdObjectSmartphone: 1102, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A56" },
    { IdObjectSmartphone: 1145, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FLIP 7 FE" },
    { IdObjectSmartphone: 109, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A22" },
    { IdObjectSmartphone: 110, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A23" },
    { IdObjectSmartphone: 113, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A32" },
    { IdObjectSmartphone: 114, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A33" },
    { IdObjectSmartphone: 120, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A53" },
    { IdObjectSmartphone: 126, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A73" },
    { IdObjectSmartphone: 133, DeFamilyModel: "GALAXY M", DeModel: "GALAXY M23" },
    { IdObjectSmartphone: 147, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S20 FE" },
    { IdObjectSmartphone: 154, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S21 FE" },
    { IdObjectSmartphone: 156, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S22" },
    { IdObjectSmartphone: 1137, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S25 EDGE" },
    { IdObjectSmartphone: 1144, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FLIP 7" },
    { IdObjectSmartphone: 1148, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FOLD 7" },
    { IdObjectSmartphone: 1096, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A26" },
    { IdObjectSmartphone: 1098, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A56" },
    { IdObjectSmartphone: 1100, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S25 PLUS" },
    { IdObjectSmartphone: 1101, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S25 ULTRA" },
    { IdObjectSmartphone: 1132, DeFamilyModel: "GALAXY A", DeModel: "GALAXY A36" },
    { IdObjectSmartphone: 1136, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S25 EDGE" },
    { IdObjectSmartphone: 1146, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FLIP 7 FE" },
    { IdObjectSmartphone: 1149, DeFamilyModel: "GALAXY Z", DeModel: "GALAXY Z FLIP 7" },
    { IdObjectSmartphone: 1169, DeFamilyModel: "GALAXY S", DeModel: "GALAXY S25 FE" }
  ];

  // Remove duplicatas por DeModel
  const uniqueModels = (models) => {
    const seen = new Map();
    models.forEach(model => {
      if (!seen.has(model.DeModel)) {
        seen.set(model.DeModel, model);
      }
    });
    return Array.from(seen.values());
  };

  let models = [];
  if (brand.toUpperCase() === 'APPLE') {
    models = uniqueModels(appleModels);
  } else if (brand.toUpperCase() === 'SAMSUNG') {
    models = uniqueModels(samsungModels);
  } else {
    return res.status(400).json({
      data: [],
      message: "Invalid brand. Use APPLE or SAMSUNG",
      hasError: true,
      errorDataCollection: ["Invalid brand parameter"],
      statusCode: 400
    });
  }

  res.status(200).json({
    data: models,
    message: "OK",
    hasError: false,
    errorDataCollection: [],
    statusCode: 200
  });
}
