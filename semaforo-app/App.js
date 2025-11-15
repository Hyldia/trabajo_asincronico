import React, {useState, useEffect, useRef} from 'react'
import { View, Text, StyleSheet, Platform, BackHandler, TouchableOpacity } from 'react-native'

// DIRECCIONES en orden horario para rotar correctamente
const DIRECCIONES = ['norte', 'este', 'sur', 'oeste']

export default function App() {
  const inicial = { norte: 'verde', sur: 'rojo', este: 'rojo', oeste: 'rojo' }
  //estado de cada luz del semaforo
  const [luz, setLuz] = useState(inicial)
  const [cambioLuz , setCambioLuz] = useState(2500)    // tiempo entre cambios de luz
  const intervalo = useRef(null)              // referencia al intervalo de tiempo
  const tiempoRef = useRef(null)              // referencia al timeout entre rojo/verde
  const indexRef = useRef(0)                  // índice de la dirección que está/estará en verde

  const PAUSA_ROJO = 150 // ms de pausa entre poner rojo y el siguiente verde

  // funcion para obtener la siguiente direccion
  const siguienteIndice = (i) => (i + 1) % DIRECCIONES.length

  // función de cambio del color de las luces
  const cambio = () => {
    const dirActual = DIRECCIONES[indexRef.current]
    if (!dirActual) return

    // poner la dirección actual a rojo inmediatamente
    setLuz(prev => ({ ...prev, [dirActual]: 'rojo' }))

    // cancela cualquier timeout pendiente
    clearTimeout(tiempoRef.current)

    // después de una pausa corta activar la siguiente dirección en verde
    tiempoRef.current = setTimeout(() => {
      indexRef.current = siguienteIndice(indexRef.current)
      const prox = DIRECCIONES[indexRef.current]

      // asegura que esten todos en rojo y luego dar verde a la siguiente
      setLuz({ norte: 'rojo', este: 'rojo', sur: 'rojo', oeste: 'rojo' })
      setTimeout(() => {
        setLuz(prev => ({ ...prev, [prox]: 'verde' }))
      }, 60) // pequeña micro-pausa para refrescar estado
    }, PAUSA_ROJO)
  }

  // intervalo automático (solo un intervalo, cambia cada cambioLuz ms)
  useEffect(() => {
    // limpiar antes de crear
    clearInterval(intervalo.current)
    clearTimeout(tiempoRef.current)

    // arrancar intervalo
    intervalo.current = setInterval(() => {
      cambio()
    }, cambioLuz)

    // limpieza al desmontar
    return () => {
      clearInterval(intervalo.current)
      clearTimeout(tiempoRef.current)
    }
    // evitar dependencia de cambio() para que no se reinicie el intervalo
  }, [cambioLuz])

  // reiniciar: vuelve a estado inicial y reinicia el índice/intervalo
  const reiniciar = () => {
    clearInterval(intervalo.current)
    clearTimeout(tiempoRef.current)
    indexRef.current = 0
    setLuz(inicial)
    intervalo.current = setInterval(() => cambio(), cambioLuz)
  }

  // funcion para salir de la aplicacion
  const exit = () => {
    if (Platform.OS === 'android') BackHandler.exitApp()
      else console.warn('Salir no soportado en esta plataforma desde la app')
  }
  // componente semaforo con rotacion
  const Semaforo = ({ direccion, rotation = '0deg' }) => {
    const estadoActual = luz[direccion]

    const color = (estadoTipo) => (estadoTipo === 'verde' ? '#00ff6aff' : '#ff0000ff')

    const luzStyle = (tipo) => [
      styles.luz,
      { backgroundColor: tipo === estadoActual ? color(tipo) : '#444' },
      tipo === estadoActual ? styles.luzActiva : null
    ]

    return (
      <View style={[styles.cajaSemaforo, { transform: [{ rotate: rotation }] }]}>
        <View accessible accessibilityLabel={`${direccion}-rojo`} style={luzStyle('rojo')} />
        <View style={{ height: 8 }} />
        <View accessible accessibilityLabel={`${direccion}-verde`} style={luzStyle('verde')} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sistema de Semáforo</Text>

      <View style={styles.cruce}>
        {/* carretera vertical */}
        <View style={styles.caminoVertical}>
          <View style={styles.lineaVertical} />
        </View>

        {/* carretera horizontal */}
        <View style={styles.caminoHorizontal}>
          <View style={styles.lineaHorizontal} />
        </View>

        {/* semáforos s más cerca de la calle correspondiente */}
        <View style={[styles.posicion, styles.norte]}>
          <Semaforo direccion="norte" rotation="0deg" />
        </View>

        <View style={[styles.posicion, styles.este]}>
          <Semaforo direccion="este" rotation="90deg" />
        </View>

        <View style={[styles.posicion, styles.sur]}>
          <Semaforo direccion="sur" rotation="180deg" />
        </View>

        <View style={[styles.posicion, styles.oeste]}>
          <Semaforo direccion="oeste" rotation="-90deg" />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={reiniciar}>
          <Text style={styles.btnText}>Reiniciar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.exitBtn]} onPress={exit}>
          <Text style={styles.btnText}>Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#258794ff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  title: {
    color: '#ffa600ff',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 12,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cruce: {
    width: '92%',
    height: '80%',
    backgroundColor: '#39524a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  caminoVertical: {
    position: 'absolute',
    width: '28%',
    height: '100%',
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center'
  },
  caminoHorizontal: {
    position: 'absolute',
    height: '28%',
    width: '100%',
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lineaVertical: {
    width: 6,
    height: '100%',
    backgroundColor: '#ffffffff',
    opacity: 1,
    borderRadius: 3
  },
  lineaHorizontal: {
    height: 6,
    width: '100%',
    backgroundColor: '#eee',
    opacity: 1,
    borderRadius: 3
  },
  esquina: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  posicion: {
    position: 'absolute',
    width: 60,   
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  norte: {
    top: 10,
    left: '50%',
    transform: [{ translateX: -30 }] // centrar horizontalmente y acercar al borde superior
  },
  sur: {
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -30 }] // centrar horizontalmente y acercar al borde inferior
  },
  este: {
    right: 40,
    top: '50%',
    transform: [{ translateY: -65 }] // centrar verticalmente y acercar al borde derecho
  },
  oeste: {
    left: 40,
    top: '50%',
    transform: [{ translateY: -65 }] // centrar verticalmente y acercar al borde izquierdo
  },

  luz: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginVertical: 4,
    backgroundColor: '#444',
  },

  luzActiva: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1.08 }]
  },

  controls: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 8
  },

  btn: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 6,
  },

  exitBtn: {
    backgroundColor: '#e74c3cff',
  },

  btnText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },

  cajaSemaforo: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#333',
    padding: 4,
    marginVertical: 2,
  },
});
