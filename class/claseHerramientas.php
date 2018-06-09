<?php

/**
 * Clase que contiene herramientas comunes a todas las clases.
 * El resto de clases de la webapp heredan de ésta.
 * 
 * @author   Juan Carlos Gómez Vicente <gvjc@iesseveroochoa.net>
 * @license  Generic Public License
 *
 * ***************************************************************
 * * LISTADO DE PROCEDIMIENTOS DE LA CLASE                       *
 * ***************************************************************
 * * Herramientas()             Constructor de la clase [vacío]
 * * conectar()                 Conecta a la base de datos [boleano, conexion]
 * * desconectar($conexion)     Desconecta de la base de datos [boleano]
 * * fecha_a_normal($a)         Transforma fecha SQL a formato imprimible [cadena]
 * * fecha_a_mysql($a)          Transforma fecha en formato imprimible a SQL [cadena]
 * * fecha_dia($dia)            Traduce el día de la semana al Castellano [cadena]
 * * fecha_mes($dia)            Traduce el mes al castellano [cadena]
 * * cortar($cadena, $tamanyo)  Corta la cadena por el tamaño especificado. Usada para resolver cuestiones de diseño [cadena]
 * * obtener_tablas()           Devuelve un array con las tablas de la base de datos [boleano, array cadenas]
 * * existe_tabla($fea)         Comprueba si existe la tabla en la base de datos [boleano]
 * *
 */

class Herramientas {
    
    /* Constructor de la clase */
    function __construct(){
        
    }
            
    function conectar(){
	try {
            $conexion = mysqli_connect(SERVIDOR, USUARIO, CONTRASENA);
            $conexion->select_db(BASEDATOS);
            $conexion->query("SET NAMES 'utf8'");
            return $conexion;
	} catch(Exception $e) {
            return false;
	}
    }
    
    function desconectar($conexion){
	try {
            mysqli_close($conexion);
            return true;
	} catch(Exception $e) {
            return false;
	}
    }
    
    function fecha_a_normal($a)
    {
        preg_match( '/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})/', $a, $feo);
        $fecha=$feo[3]."/".$feo[2]."/".$feo[1];
        return $fecha;
    }

    function fecha_a_mysql($a)
    {
	preg_match( '/([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})/', $a, $feo);
        $fecha=$feo[3]."-".$feo[2]."-".$feo[1];
        return $fecha;
    } 

    function fecha_dia($dia)
    {
        $feo = "";
        switch ($dia){
            case "Monday":  	$feo = "lunes"; 		break;
            case "Tuesday":  	$feo = "martes"; 		break;
            case "Wednesday":  	$feo = "mi&eacute;rcoles"; 	break;
            case "Thursday":  	$feo = "jueves"; 		break;
            case "Friday":  	$feo = "viernes"; 		break;
            case "Saturday":  	$feo = "s&aacute;bado"; 	break;
            case "Sunday":  	$feo = "domingo"; 		break;
        }
        return $feo;
    }

    function fecha_mes($dia)
    {
        $feo = "";
        switch ($dia){
            case "1":  $feo = "enero"; 		break;
            case "2":  $feo = "febrero"; 	break;
            case "3":  $feo = "marzo"; 		break;
            case "4":  $feo = "abril"; 		break;
            case "5":  $feo = "mayo"; 		break;
            case "6":  $feo = "junio"; 		break;
            case "7":  $feo = "julio"; 		break;
            case "8":  $feo = "agosto"; 	break;
            case "9":  $feo = "septiembre"; 	break;
            case "10": $feo = "octubre"; 	break;
            case "11": $feo = "noviembre";      break;
            case "12": $feo = "diciembre";      break;
        }
        return $feo;
    }

    function cortar($cadena, $tamanyo){
	$letras = strlen($cadena);
	if ( $letras > $tamanyo ) {
            $feo = substr($cadena, 0, $tamanyo-3)."...";
	} else {
            $feo = substr($cadena, 0, $tamanyo);		
	}
	return $feo;
    }
    
    function obtener_tablas()
    {
        try {
            $conexion = $this->conectar();
            $rs = $conexion->query("SHOW TABLES");
            while($fila = $rs->fetch_row()) {
                $tablas[]=$fila['0'];
            }
            return $tablas;
        } catch (Exception $e) {
            return false;
        }
    }
    
    function existe_tabla($fea)
    {
        return in_array($fea, $this->obtener_tablas());
    }
    
} # Fin de la clase

?>