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

  const xiaomiModels = [
    { IdObjectSmartphone: 578, DeFamilyModel: "REDMI", DeModel: "REDMI 13T PRO" },
    { IdObjectSmartphone: 1047, DeFamilyModel: "POCO F", DeModel: "POCO F6 PRO" },
    { IdObjectSmartphone: 361, DeFamilyModel: "POCO M", DeModel: "POCO M5S" },
    { IdObjectSmartphone: 385, DeFamilyModel: "MI", DeModel: "MI 12 LITE" },
    { IdObjectSmartphone: 393, DeFamilyModel: "POCO X", DeModel: "POCO X4 PRO" },
    { IdObjectSmartphone: 418, DeFamilyModel: "POCO X", DeModel: "POCO X5 PRO" },
    { IdObjectSmartphone: 424, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 12S" },
    { IdObjectSmartphone: 445, DeFamilyModel: "REDMI", DeModel: "REDMI 12C" },
    { IdObjectSmartphone: 446, DeFamilyModel: "POCO M", DeModel: "POCO M5" },
    { IdObjectSmartphone: 448, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 11 PRO" },
    { IdObjectSmartphone: 477, DeFamilyModel: "REDMI", DeModel: "REDMI 12" },
    { IdObjectSmartphone: 491, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 12" },
    { IdObjectSmartphone: 492, DeFamilyModel: "POCO X", DeModel: "POCO X5" },
    { IdObjectSmartphone: 538, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 13" },
    { IdObjectSmartphone: 974, DeFamilyModel: "POCO C", DeModel: "POCO C65" },
    { IdObjectSmartphone: 1001, DeFamilyModel: "REDMI A", DeModel: "REDMI A3" },
    { IdObjectSmartphone: 1091, DeFamilyModel: "REDMI", DeModel: "REDMI 13" },
    { IdObjectSmartphone: 1107, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14" },
    { IdObjectSmartphone: 1147, DeFamilyModel: "POCO C", DeModel: "POCO C75" },
    { IdObjectSmartphone: 1166, DeFamilyModel: "POCO C", DeModel: "POCO C85" },
    { IdObjectSmartphone: 1204, DeFamilyModel: "REDMI", DeModel: "REDMI 14C" },
    { IdObjectSmartphone: 203, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 11" },
    { IdObjectSmartphone: 204, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 11S" },
    { IdObjectSmartphone: 383, DeFamilyModel: "POCO X", DeModel: "POCO X4 PRO" },
    { IdObjectSmartphone: 401, DeFamilyModel: "POCO F", DeModel: "POCO F4" },
    { IdObjectSmartphone: 417, DeFamilyModel: "POCO X", DeModel: "POCO X5 PRO" },
    { IdObjectSmartphone: 425, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 12S" },
    { IdObjectSmartphone: 444, DeFamilyModel: "POCO X", DeModel: "POCO X5" },
    { IdObjectSmartphone: 478, DeFamilyModel: "REDMI", DeModel: "REDMI 12" },
    { IdObjectSmartphone: 490, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 12 PRO" },
    { IdObjectSmartphone: 508, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 12" },
    { IdObjectSmartphone: 533, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 11 PRO" },
    { IdObjectSmartphone: 537, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 13" },
    { IdObjectSmartphone: 560, DeFamilyModel: "POCO X", DeModel: "POCO X6" },
    { IdObjectSmartphone: 563, DeFamilyModel: "POCO X", DeModel: "POCO X6 PRO" },
    { IdObjectSmartphone: 567, DeFamilyModel: "MI", DeModel: "MI 13 PRO" },
    { IdObjectSmartphone: 572, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 13 PRO" },
    { IdObjectSmartphone: 960, DeFamilyModel: "REDMI", DeModel: "REDMI 13C" },
    { IdObjectSmartphone: 966, DeFamilyModel: "MI", DeModel: "MI 13 LITE" },
    { IdObjectSmartphone: 971, DeFamilyModel: "POCO M", DeModel: "POCO M6 PRO" },
    { IdObjectSmartphone: 973, DeFamilyModel: "POCO C", DeModel: "POCO C65" },
    { IdObjectSmartphone: 979, DeFamilyModel: "POCO F", DeModel: "POCO F6" },
    { IdObjectSmartphone: 981, DeFamilyModel: "POCO F", DeModel: "POCO F5" },
    { IdObjectSmartphone: 1041, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 13 PRO PLUS" },
    { IdObjectSmartphone: 1043, DeFamilyModel: "REDMI", DeModel: "REDMI 13T PRO" },
    { IdObjectSmartphone: 1045, DeFamilyModel: "MI", DeModel: "MI 13T PRO" },
    { IdObjectSmartphone: 1048, DeFamilyModel: "MI", DeModel: "MI 14 ULTRA" },
    { IdObjectSmartphone: 1053, DeFamilyModel: "REDMI", DeModel: "REDMI 14C" },
    { IdObjectSmartphone: 1079, DeFamilyModel: "POCO C", DeModel: "POCO C75" },
    { IdObjectSmartphone: 1082, DeFamilyModel: "POCO X", DeModel: "POCO X7" },
    { IdObjectSmartphone: 1087, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14 PRO" },
    { IdObjectSmartphone: 1088, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14" },
    { IdObjectSmartphone: 1106, DeFamilyModel: "POCO X", DeModel: "POCO X7 PRO" },
    { IdObjectSmartphone: 1126, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14S" },
    { IdObjectSmartphone: 1139, DeFamilyModel: "MI", DeModel: "MI 15" },
    { IdObjectSmartphone: 1151, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14 PRO PLUS" },
    { IdObjectSmartphone: 1165, DeFamilyModel: "POCO M", DeModel: "POCO M7 PRO" },
    { IdObjectSmartphone: 1167, DeFamilyModel: "POCO M", DeModel: "POCO M7" },
    { IdObjectSmartphone: 1124, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14 PRO PLUS" },
    { IdObjectSmartphone: 1140, DeFamilyModel: "MI", DeModel: "MI 15" },
    { IdObjectSmartphone: 1170, DeFamilyModel: "MI", DeModel: "MI 14T PRO" },
    { IdObjectSmartphone: 1171, DeFamilyModel: "POCO F", DeModel: "POCO F7" },
    { IdObjectSmartphone: 569, DeFamilyModel: "POCO X", DeModel: "POCO X6 PRO" },
    { IdObjectSmartphone: 577, DeFamilyModel: "REDMI", DeModel: "REDMI 13T PRO" },
    { IdObjectSmartphone: 965, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 13 PRO PLUS" },
    { IdObjectSmartphone: 972, DeFamilyModel: "POCO M", DeModel: "POCO M6 PRO" },
    { IdObjectSmartphone: 980, DeFamilyModel: "POCO F", DeModel: "POCO F6" },
    { IdObjectSmartphone: 996, DeFamilyModel: "MI", DeModel: "MI 14" },
    { IdObjectSmartphone: 997, DeFamilyModel: "MI", DeModel: "MI 14 ULTRA" },
    { IdObjectSmartphone: 1032, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 13 PRO" },
    { IdObjectSmartphone: 1033, DeFamilyModel: "POCO F", DeModel: "POCO F6 PRO" },
    { IdObjectSmartphone: 1034, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 13" },
    { IdObjectSmartphone: 1054, DeFamilyModel: "MI", DeModel: "MI 14T" },
    { IdObjectSmartphone: 1081, DeFamilyModel: "POCO X", DeModel: "POCO X7 PRO" },
    { IdObjectSmartphone: 1089, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14" },
    { IdObjectSmartphone: 1090, DeFamilyModel: "POCO X", DeModel: "POCO X7" },
    { IdObjectSmartphone: 1095, DeFamilyModel: "POCO X", DeModel: "POCO X6" },
    { IdObjectSmartphone: 1104, DeFamilyModel: "REDMI NOTE", DeModel: "REDMI NOTE 14 PRO" },
    { IdObjectSmartphone: 507, DeFamilyModel: "REDMI", DeModel: "REDMI 12C" }
  ];

  const motorolaModels = [
    { IdObjectSmartphone: 1129, DeFamilyModel: "MOTO RAZR", DeModel: "MOTO RAZR 60 ULTRA" },
    { IdObjectSmartphone: 405, DeFamilyModel: "MOTO G", DeModel: "MOTO G53" },
    { IdObjectSmartphone: 429, DeFamilyModel: "MOTO G", DeModel: "MOTO G73" },
    { IdObjectSmartphone: 487, DeFamilyModel: "MOTO G", DeModel: "MOTO G54" },
    { IdObjectSmartphone: 954, DeFamilyModel: "MOTO G", DeModel: "MOTO G34" },
    { IdObjectSmartphone: 970, DeFamilyModel: "MOTO G", DeModel: "MOTO G24 POWER" },
    { IdObjectSmartphone: 1069, DeFamilyModel: "MOTO G", DeModel: "MOTO G35" },
    { IdObjectSmartphone: 1071, DeFamilyModel: "MOTO G", DeModel: "MOTO G05" },
    { IdObjectSmartphone: 1134, DeFamilyModel: "MOTO G", DeModel: "MOTO G15" },
    { IdObjectSmartphone: 17, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 30" },
    { IdObjectSmartphone: 18, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 30 PRO" },
    { IdObjectSmartphone: 353, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 30 ULTRA" },
    { IdObjectSmartphone: 428, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 30 FUSION" },
    { IdObjectSmartphone: 474, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 40" },
    { IdObjectSmartphone: 486, DeFamilyModel: "MOTO G", DeModel: "MOTO G84" },
    { IdObjectSmartphone: 489, DeFamilyModel: "MOTO RAZR", DeModel: "MOTO RAZR 40 ULTRA" },
    { IdObjectSmartphone: 542, DeFamilyModel: "MOTO G", DeModel: "MOTO G54" },
    { IdObjectSmartphone: 543, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 40 NEO" },
    { IdObjectSmartphone: 585, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 50 PRO" },
    { IdObjectSmartphone: 586, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 50 FUSION" },
    { IdObjectSmartphone: 588, DeFamilyModel: "MOTO RAZR", DeModel: "MOTO RAZR 40" },
    { IdObjectSmartphone: 1008, DeFamilyModel: "MOTO G", DeModel: "MOTO G34" },
    { IdObjectSmartphone: 1028, DeFamilyModel: "MOTO G", DeModel: "MOTO G85" },
    { IdObjectSmartphone: 1029, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 50" },
    { IdObjectSmartphone: 1030, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 50 NEO" },
    { IdObjectSmartphone: 1038, DeFamilyModel: "MOTO G", DeModel: "MOTO G55" },
    { IdObjectSmartphone: 1051, DeFamilyModel: "MOTO G", DeModel: "MOTO G24" },
    { IdObjectSmartphone: 1052, DeFamilyModel: "MOTO G", DeModel: "MOTO G75" },
    { IdObjectSmartphone: 1059, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 30 NEO" },
    { IdObjectSmartphone: 1070, DeFamilyModel: "MOTO G", DeModel: "MOTO G35" },
    { IdObjectSmartphone: 1072, DeFamilyModel: "MOTO G", DeModel: "MOTO G15" },
    { IdObjectSmartphone: 1105, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 60 FUSION" },
    { IdObjectSmartphone: 1128, DeFamilyModel: "MOTO RAZR", DeModel: "MOTO RAZR 60" },
    { IdObjectSmartphone: 1131, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 60 PRO" },
    { IdObjectSmartphone: 1135, DeFamilyModel: "MOTO G", DeModel: "MOTO G56" },
    { IdObjectSmartphone: 1138, DeFamilyModel: "MOTO G", DeModel: "MOTO G86" },
    { IdObjectSmartphone: 1123, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 60" },
    { IdObjectSmartphone: 1130, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 60 PRO" },
    { IdObjectSmartphone: 978, DeFamilyModel: "MOTO EDGE", DeModel: "MOTO EDGE 50 ULTRA" },
    { IdObjectSmartphone: 1007, DeFamilyModel: "MOTO RAZR", DeModel: "MOTO RAZR 50 ULTRA" },
    { IdObjectSmartphone: 1103, DeFamilyModel: "MOTO RAZR", DeModel: "MOTO RAZR 50" }
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
  } else if (brand.toUpperCase() === 'MOTOROLA') {
    models = uniqueModels(motorolaModels);
  } else if (brand.toUpperCase() === 'XIAOMI') {
    models = uniqueModels(xiaomiModels);
  } else {
    return res.status(400).json({
      data: [],
      message: "Invalid brand. Use APPLE, SAMSUNG, MOTOROLA or XIAOMI",
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
