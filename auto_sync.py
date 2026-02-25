#!/usr/bin/env python3
"""
Script para auto-sincronización periódica entre BD y Excel
"""

import time
import os
from datetime import datetime
from sync_excel import exportar_a_excel
from database import CasamientoDatabase

def auto_sync(intervalo_minutos=5):
    """
    Auto-sincronización cada X minutos
    Exporta cambios de la BD al Excel automáticamente
    """
    print("🔄 Auto-sincronización activada")
    print(f"⏰ Intervalo: cada {intervalo_minutos} minutos")
    print("⚠️  Presioná Ctrl+C para detener\n")
    
    db = CasamientoDatabase()
    ultima_sync = datetime.now()
    
    try:
        while True:
            time.sleep(intervalo_minutos * 60)
            
            # Verificar si hay cambios
            cambios = db.get_cambios_desde(ultima_sync.strftime('%Y-%m-%d %H:%M:%S'))
            
            if cambios:
                print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 📥 Detectados {len(cambios)} cambios")
                print("📤 Exportando a Excel...")
                
                try:
                    exportar_a_excel()
                    print("✅ Sincronización completada")
                    ultima_sync = datetime.now()
                except Exception as e:
                    print(f"❌ Error al exportar: {e}")
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ✓ Sin cambios")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Auto-sincronización detenida")
        print("💾 Realizando última exportación...")
        try:
            exportar_a_excel()
            print("✅ Datos guardados correctamente")
        except:
            print("⚠️  No se pudo realizar la última exportación")

if __name__ == '__main__':
    import sys
    
    intervalo = 5  # Por defecto 5 minutos
    
    if len(sys.argv) > 1:
        try:
            intervalo = int(sys.argv[1])
        except:
            print("Uso: python3 auto_sync.py [minutos]")
            print("Ejemplo: python3 auto_sync.py 10  (sincroniza cada 10 minutos)")
            sys.exit(1)
    
    auto_sync(intervalo)
