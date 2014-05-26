PROGRAM LinProgCGI
  IMPLICIT NONE
  EXTERNAL GET_XML, PARSE_XML_MN, PARSE_XML_ABC, Simplex, Dual, Interv_of_stab

  !Переменные для решения задачи
  INTEGER M, N, INFO
  REAL(8), ALLOCATABLE, DIMENSION(:,:) :: A, D, DB
  REAL(8), ALLOCATABLE, DIMENSION(:) :: A0, b, c, X, Y
  REAL(8) :: F, G
  INTEGER, ALLOCATABLE, DIMENSION(:) :: BP
  !Переменные управления процессом
  REAL(8) :: eps
  LOGICAL(1) :: NEED_DUAL, NEED_INTERV
  INTEGER :: INFO2
  !Прочие переменные
  INTEGER :: i, j, k
  CHARACTER, ALLOCATABLE, DIMENSION(:) :: CONT, XML
  INTEGER :: CL
  CHARACTER(64) :: CL0, X0

  !HTTP-заголовки
  print "(A)", "Content-Type: text/xml; charset=utf-8"//CHAR(10)

  !Получение данных
  CALL GETENV("CONTENT_LENGTH", CL0)
  READ(CL0, *) CL
  ALLOCATE( CONT(CL+1) )
  CALL GET_DATA(CONT, CL)

  !Преобразование данных
  ALLOCATE( XML(CL+1) )
  CALL GET_XML(CONT, CL, XML)

  DEALLOCATE( CONT )

  CALL PARSE_XML_MN(XML, M, N, NEED_DUAL, NEED_INTERV, eps)

  ALLOCATE( A0(M*N) )
  ALLOCATE( b(M) )
  ALLOCATE( c(N) )
  CALL PARSE_XML_ABC(XML, M, N, A0, b, c, INFO2)

  DEALLOCATE( XML )

  IF (INFO2 .EQ. 0) THEN
    ALLOCATE( A(m,n) )
    k = 1
    DO i=1,m
      DO j=1,n
        A(i,j) = A0(k)
        k = k + 1
      END DO
    END DO
  END IF
  DEALLOCATE( A0 )

  !Заголовок XML
  print "(A)", "<?xml version='1.0' encoding='utf-8'?>"
  print "(A)", "<linprog_answer>"

  IF (INFO2 .NE. 0) THEN
    print "(A)", "  <error mission='parse'>"
    print "(I2)", INFO2
    print "(A)", "  </error>"
    DEALLOCATE( b )
    DEALLOCATE( c )
    print "(A)", "</linprog_answer>"
    RETURN
  END IF

  !Решение прямой задачи
  AlLOCATE( BP(m) )
  ALLOCATE( X(n) )
  CALL Simplex(A, b, c, m, n, eps, X, F, BP, INFO)

  IF (INFO .EQ. 0) THEN
    print "(A)", "  <primal>"
    print "(A)", "   <BP>"
    print *, BP
    print "(A)", "   </BP>"
    print "(A)", "    <X>"
    print *, X
    print "(A)", "    </X>"
    print "(A)", "    <F>"
    print *, F
    print "(A)", "    </F>"
    print "(A)", "  </primal>"
  ELSE
    print "(A)", "  <error mission='primal'>"
    print "(I2)", INFO
    print "(A)", "  </error>"
  END IF

  !Решение двойственной задачи
  IF (NEED_DUAL) THEN
    ALLOCATE( Y(m) )
    CALL Dual(A, b, c, X, F, BP, m, n, eps, Y, G, INFO)

    IF (INFO .EQ. 0) THEN
      print "(A)", "  <dual>"
      print "(A)", "    <Y>"
      print *, Y
      print "(A)", "    </Y>"
      print "(A)", "    <G>"
      print *, G
      print "(A)", "    </G>"
      print "(A)", "  </dual>"
    ELSE
      print "(A)", "  <error mission='dual'>"
      print *, INFO
      print "(A)", "  </error>"
    END IF

    DEALLOCATE( Y )
  END IF

  !Расчет интервалов устойчивости
  IF (NEED_INTERV) THEN
    ALLOCATE( D(m,m) )
    ALLOCATE( DB(m,2) )
    CALL Interv_of_stab(A, b, X, BP, m, n, eps, D, DB, INFO)

    IF (INFO .EQ. 0) THEN
      print "(A)", "  <intervals>"
      DO i=1,m
        print "(A)", "   <i>"
        print "(I4)", i
        print "(A)", "    <bm>"
        print *, DB(i,1)
        print "(A)", "    </bm>"
        print "(A)", "    <bp>"
        print *, DB(i,2)
        print "(A)", "    </bp>"
        print "(A)", "   </i>"
      END DO
      print "(A)", "   <D>"
      print "(A)", "    <![CDATA["
      print *, ((D(i,j), j=1,m), CHAR(10), i=1,m)
      print "(A)", "    ]]>"
      print "(A)", "   </D>"
      print "(A)", "  </intervals>"
    ELSE
      print "(A)", "  <error mission='intervals'>"
      print *, INFO
      print "(A)", "  </error>"
    END IF

    DEALLOCATE( D )
    DEALLOCATE( DB )
  END IF


  !Окончание вывода данных
  print "(A)", "</linprog_answer>"

  DEALLOCATE( A )
  DEALLOCATE( b )
  DEALLOCATE( c )
  DEALLOCATE( X )
  DEALLOCATE( BP )
END

SUBROUTINE GET_DATA(CONT, CL)
  IMPLICIT NONE
  !Параметры процедуры
  INTEGER :: CL                       !Длина POST-запроса
  CHARACTER(CL) :: CONT0              !Строка POST-запроса
  CHARACTER, DIMENSION(CL+1) :: CONT  !C-строка запроса
  !Прочие переменные
  INTEGER :: i

  !Ввод данных
  READ(*, "(A)") CONT0

  !Преобразование данных
  DO i=1,CL
    CONT(i) = CONT0(i:i)
  END DO
  CONT(CL+1) = CHAR(0)
END
