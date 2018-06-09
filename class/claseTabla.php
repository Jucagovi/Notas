<?php

/**
 * Clase para manejar una tabla de la base de datos.
 * Hereda de la clase Herramientas
 * 
 * @author   Juan Carlos Gómez Vicente <gvjc@iesseveroochoa.net>
 * @license  Generic Public License
 *
 * ***************************************************************
 * * LISTADO DE PROCEDIMIENTOS DE LA CLASE                       *
 * ***************************************************************
 * Tabla($fea)                  Constructor de la clase [vacío]
 * get_tabla()                  Getter para la variable $tabla [cadena]
 * obtener_id()                 Devuelve el nombre de la clave primaria de la tabla [cadena]
 * obtener_columnas()           Devuelve las columnas de la tabla [array cadenas]
 * numero_filas()               Número de registros en la tabla [int]
 * borrar($id)                  Elimina una fila con el $id pasado por parámetro [boleano]
 * insertar($valores)           Inserta un array de valores en la tabla [boleano]
 * mostrar_consulta($valores)   Muestra la sentencia INSERT por pantalla [cadena]
 * tiene_id()                   Devuelve la presencia o ausencia del campo identificador [boleano]
 * generar_identificador($id)   Devuelve un identificador para el atributo "id" de HTML. Si existe y no está vacío el campo "identificador" lo asigna. [cadena}
 */

class Tabla extends Herramientas{
    
    private $tabla;     # El nombre de la tabla sobre la que se van a realizar las funciones
    
    function __construct($fea) {
        $this->tabla = $fea;
    }
    
    function get_tabla() {
        return $this->tabla;
    }
    
    function obtener_id() {
        try {
            $conexion = $this->conectar();
            $rs = $conexion->query("SHOW INDEX FROM ".$this->tabla." WHERE Key_name = 'PRIMARY'");
            $fila = $rs->fetch_row();
            return $fila['4'];
        } catch(Exception $e) {
            return false;
        }
    }
    
    function obtener_columnas() {
        try {
            $conectar = $this->conectar();
            $rs = $conectar->query("SHOW COLUMNS FROM ".$this->tabla);
            while($fila = $rs->fetch_row())
            {
                $columnas[]=$fila['0'];
            }
            return $columnas;
        } catch (Exception $e) {
            return false;
        } 
    }
    
    function numero_filas() {
        try {
            $conexion = $this->conectar();
            $rs = $conexion->query("SELECT count(*) FROM ".$this->tabla);
            $fila = $rs->fetch_row();
            return $fila['0'];
        } catch(Exception $e) {
            return false;
        }
    }

    function borrar($id) {
        try {
            $conexion = $this->conectar();
            return $conexion->query("DELETE FROM ".$this->tabla." WHERE ".$this->obtener_id()." = '".$id."';");
        } catch(Exception $e) {
            return false;
        }
    }
    
    function insertar($valores) {
        $insert = "INSERT INTO `".$this->tabla."` (";
        $columnas = $this->obtener_columnas();
        $a=1;
        foreach ($columnas as $i) {	
            if ( $a < count($columnas) ) {
                $insert .= "`".$i."`, ";
            } else {
                $insert .= "`".$i."` ";
            }
            $a++;
        }
        $insert .= ") VALUES (";
        $a=1;
        foreach ($columnas as $j) {
            if ( $a < count($columnas) ) {
                if ( $j != $this->obtener_id() ) {
                    $insert .= "'".@addslashes($valores[$j])."', ";			
                } else {
                    $insert .= "NULL, ";
                } 
            } else {
                $insert .= "'".@addslashes($valores[$j])."' ";
            }
            $a++;
        }
        $insert .= ");";
        
        try {
            $conexion = $this->conectar();
            return $conexion->query($insert);
        } catch(Exception $e) {
            return false;
        }
    }
    
    function mostrar_insertar($valores) {
        $insert = "INSERT INTO `".$this->tabla."` (";
        $columnas = $this->obtener_columnas();
        $a=1;
        foreach ($columnas as $i)
        {	
            if ( $a < count($columnas) ) {
                $insert .= "`".$i."`, ";
            } else {
                $insert .= "`".$i."` ";
            }
            $a++;
        }
        $insert .= ") VALUES (";
        $a=1;
        foreach ($columnas as $j)
        {
            if ( $a < count($columnas) )
            {
                if ( $j != $this->obtener_id() ) {
                    $insert .= "'".@addslashes($valores[$j])."', ";			
                } else {
                    $insert .= "NULL, ";
                } 
            } else {
                $insert .= "'".@addslashes($valores[$j])."' ";
            }
            $a++;
        }
        $insert .= ");";
        return $insert;
    }
    
    function mostrar_actualizar($id, $valores)
    {	 
        $actualizar = "UPDATE `".$this->tabla."` SET ";
        $columnas = $this->obtener_columnas();
        $a=1;
        foreach ($columnas as $i) {	
            if ( $a < count($columnas) ) {
                if ( $i != $this->obtener_id() ) $actualizar .= "`".$i."` = '".@addslashes($valores[$i])."', ";
            } else {
                $actualizar .= "`".$i."` = '".@addslashes($valores[$i])."' ";
            }
            $a++;
        }
        $actualizar .= "WHERE `".$this->obtener_id()."` = ".$id.";";
        
        return $actualizar;
    }
    
    function actualizar($id, $valores)
    {	
        $actualizar = "UPDATE `".$this->tabla."` SET ";
        $columnas = $this->obtener_columnas();
        $a=1;
        foreach ($columnas as $i) {	
            if ( $a < count($columnas) ) {
                if ( $i != $this->obtener_id() ) $actualizar .= "`".$i."` = '".@addslashes($valores[$i])."', ";
            } else {
                $actualizar .= "`".$i."` = '".@addslashes($valores[$i])."' ";
            }
            $a++;
        }
        $actualizar .= "WHERE `".$this->obtener_id()."` = ".$id.";";
        
        try {
            $conexion = $this->conectar();
            return $conexion->query($actualizar);
        } catch(Exception $e){
            return false;
        }
    }
    
    function tiene_id(){
        try {
            $conexion = $this->conectar();
            $rs = $conexion->query("SHOW COLUMNS FROM ".$this->get_tabla()." WHERE FIELD ='identificador'" );
            if ( $rs->num_rows == 0 ){
                return false;
            } else {
                return true;
            }
        } catch(Exception $e){
            return false;
        }
    }
    
    function generar_identificador($id){
        try {
            if ($this->tiene_id()){
                $conexion = $this->conectar();
                $rs = $conexion->query("SELECT identificador FROM ".$this->get_tabla()." WHERE ".$this->obtener_id()."=".$id);
                $fila = $rs->fetch_array();
                if ( $fila["identificador"] == "" ){
                    $feo = $this->get_tabla().$id;   
                } else {
                    $feo = $fila["identificador"];
                }
            } else {
                $feo = $this->get_tabla().$id;
            }
            return $feo;
        } catch(Exception $e){
            return false;
        }
    }
    
} # Fin de la clase

?>