#!/usr/bin/env tsx

import { seedISO45001Standards } from "../server/iso45001-seed";

async function main() {
  console.log("🚀 Iniciando población de ISO 45001...\n");
  
  try {
    const result = await seedISO45001Standards();
    
    console.log("\n✅ Población completada exitosamente!");
    console.log(`   📊 ${result.standards.length} estándares insertados`);
    console.log(`   📋 ${result.items.length} ítems insertados`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error en la población:", error);
    process.exit(1);
  }
}

main();
