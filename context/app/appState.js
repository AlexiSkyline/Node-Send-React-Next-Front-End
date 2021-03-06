import React, { useReducer } from 'react'
import { appContext } from './appContext';
import appReducer from './appReducer';
import { OCULTAR_ALERTA, 
         MOSTRAR_ALERTA, 
         SUBIR_ARCHIVO_EXITO, 
         SUBIR_ARCHIVO_ERROR, 
         SUBIR_ARCHIVO, 
         CREAR_ENLACE_EXITO,
         LIMPIAR_STATE,
         AGREGAR_PASSWORD,
         AGREGAR_DESCARGAS,
         VERIFICAR_PASSWORD } from '../../types';

import { clienteAxios } from '../../config/axios';

export const AppState = ( props ) => {
    const initialState = {
        mensajeArchivo: null,
        nombre: '',
        nombreOriginal: '',
        cargando: null,
        descargas: 1,
        password: '',
        autor: null,
        url: '',
        hasPassword: null
    }

    const [ state, dispatch ] = useReducer( appReducer, initialState );

    // TODO: Muestra una alerta
    const mostrarAlerta = ( msg ) => {
        dispatch({
            type: MOSTRAR_ALERTA,
            payload: msg
        });

        //* Limpiar alerta despues de 3 Segundos
        setTimeout(() => {
            dispatch({
                type: OCULTAR_ALERTA
            });
        }, 3000);
    }

    // TODO: Sube los archivos al servidor
    const subirArchivos = async ( formData, nombreArchivo ) => {
        
        dispatch({
            type: SUBIR_ARCHIVO
        });

        try {
            const respuesta = await clienteAxios.post( '/api/archivos', formData );
            
            dispatch({
                type: SUBIR_ARCHIVO_EXITO,
                payload: {
                    nombre: respuesta.data.archivos,
                    nombreOriginal: nombreArchivo
                }
            });
        } catch (error) {
            dispatch({
                type: SUBIR_ARCHIVO_ERROR,
                payload: error.response.data.msg
            });
        }
    }

    // Todo: Crea un enlace una vez que se haya subidó el archivo
    const crearEnlace = async () => {
        const data = {
            nombre: state.nombre,
            nombre_original: state.nombreOriginal,
            descargas: state.descargas,
            password: state.password,
            autor: state.autor
        }

        try {
            const respuesta = await clienteAxios.post( '/api/enlaces', data );
            
            dispatch({
                type: CREAR_ENLACE_EXITO,
                payload: respuesta.data.msg
            });
        } catch (error) {
            mostrarAlerta( error.response.data.msg );
        }
    }

    // Todo: Reinicia el state
    const limpiarState = () => {
        dispatch({
            type: LIMPIAR_STATE
        });
    }

    // Todo: Agrega una contraseña al state
    const agregarPassword = ( password ) => {
        dispatch({
            type: AGREGAR_PASSWORD,
            payload: password
        })
    }

    // Todo: Agrega un número de descargas
    const agregarDescargas = ( descargas ) => {
        dispatch({
            type: AGREGAR_DESCARGAS,
            payload: descargas
        });
    }

    const verificarPassword = async ( enlace, data ) => {
        try {
            const resultado = await clienteAxios.post( `/api/enlaces/${ enlace }`, data );
            dispatch({
                type: VERIFICAR_PASSWORD,
                payload: resultado.data.password
            });
        } catch (error) {
            mostrarAlerta( error.response.data.msg );
        }
    }

    return (
        <appContext.Provider
            value={{
                mensajeArchivo: state.mensajeArchivo,
                nombre: state.nombre,
                nombreOriginal: state.nombreOriginal,
                cargando: state.cargando,
                descargas: state.descargas,
                password: state.password,
                autor: state.autor,
                url: state.url,
                hasPassword: state.hasPassword,
                mostrarAlerta,
                subirArchivos,
                crearEnlace,
                limpiarState,
                agregarPassword,
                agregarDescargas,
                verificarPassword,
            }}
        >
            { props.children }
        </appContext.Provider>
    );
}