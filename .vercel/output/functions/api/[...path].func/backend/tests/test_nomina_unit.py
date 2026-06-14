from app.services.nomina import calcular_totales


def test_calcular_quincenal_completo() -> None:
    bruto, neto = calcular_totales(
        salario_base=3000,
        tipo_pago="quincenal",
        dias_trabajados=15,
        horas_extra=0,
        bonos=0,
        deducciones=0,
    )
    assert bruto == 3000
    assert neto == 3000


def test_calcular_con_deducciones_y_extra() -> None:
    bruto, neto = calcular_totales(
        salario_base=3000,
        tipo_pago="quincenal",
        dias_trabajados=15,
        horas_extra=2,
        bonos=100,
        deducciones=200,
        tarifa_hora_extra=50,
    )
    assert bruto == 3000 + 100 + 100
    assert neto == bruto - 200


def test_calcular_descuento_prestamos() -> None:
    bruto, neto = calcular_totales(
        salario_base=3000,
        tipo_pago="quincenal",
        dias_trabajados=15,
        horas_extra=0,
        bonos=0,
        deducciones=50,
        descuento_prestamos=200,
    )
    assert bruto == 3000
    assert neto == 2750
