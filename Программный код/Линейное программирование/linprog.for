!Процедура для решения канонической задачи ЛП (максисизация)
SUBROUTINE Simplex(A, b, c, m, n, eps, X, F, BP, INFO)
  IMPLICIT NONE
  EXTERNAL DSYEV
  !Параметры процедуры
  INTEGER, INTENT(IN) :: m, n               !Размерности задачи
  REAL(8), DIMENSION(m,n), INTENT(IN) :: A  !Матрица коэфициентов
  REAL(8), DIMENSION(m), INTENT(IN) :: b    !Вектор правых частей
  REAL(8), DIMENSION(n), INTENT(IN) :: c    !Вектор коэффициентов ЦФ
  REAL(8), INTENT(IN) :: eps                !Радиус нуля (показывает, какие числа считать значимо отличающимися от нуля)
  REAL(8), DIMENSION(n), INTENT(OUT) :: X   !Вектор результата
  REAL(8), INTENT(OUT) :: F                 !Значение целевой функции в оптимальной точке
  INTEGER, DIMENSION(m), INTENT(OUT) :: BP  !Вектор номеров базисных переменных
  INTEGER, INTENT(OUT) :: INFO              !Информация:
                                            ! 0 - все нормально;
                                            ! 1 - невозможно рассчитать собственные числа матрицы A;
                                            ! 2 - rank A < m;
                                            ! 3 - ошибка определения разрешающего столбца;
                                            ! 4 - ошибка определения разрешающей строки;
                                            ! 5 - ограничения не совместны;
                                            ! 6 - ОДР не ограничена сверху.
  !Переменные симплекс-метода
  REAL(8) :: KM                                     !Коэффициент M
  REAL(8), ALLOCATABLE, DIMENSION(:,:) :: ST        !Массив для записи симплекс-таблицы
  REAL(8), ALLOCATABLE, DIMENSION(:) :: S0          !Массив для записи разрешающего столбца
  LOGICAL :: NEED_BETTER                            !Нужно ли улучшение плана?
  INTEGER :: RK, RS                                 !Номера разрешающих столбца и строки
  REAL(8), ALLOCATABLE, DIMENSION(:) :: MV          !Вектор для учета коэффициента M в оценках замещения
  LOGICAL :: VYR                                    !Является ли текущая угловая точка вырожденной?
  INTEGER, ALLOCATABLE, DIMENSION(:) :: LEX         !Массив для поиска лексикографического минимума...
  !Переменные для проверки ранга матрицы коэффициентов
  REAL(8), ALLOCATABLE, DIMENSION(:,:) :: ATA
  REAL(8), ALLOCATABLE, DIMENSION(:) :: EIG
  INTEGER :: RANK
  !Прочие переменные
  INTEGER :: i, j, k, l
  REAL(8), ALLOCATABLE, DIMENSION(:) :: WORK
  INTEGER :: LWORK
  LOGICAL :: IS_DEBUG

  !Производится ли режим отладки?
  IS_DEBUG = .FALSE.

  !Инициализация X и F
  X = 0
  F = 0

  !Проверка ранга матрицы A
  LWORK = 3*n
  ALLOCATE( ATA(n,n) )
  ALLOCATE( EIG(n) )
  ALLOCATE( WORK(LWORK) )

  ATA = MATMUL( TRANSPOSE(A), A )
  CALL DSYEV ( 'N', 'U', n, ATA, n, EIG, WORK, LWORK, INFO )
  IF (INFO .NE. 0) THEN
    INFO = 1 !Ошибка №1 - невозможно рассчитать собственные числа матрицы A
    RETURN
  END IF

  RANK = 0
  DO i=1,n
    IF ( ABS(EIG(i)) > eps ) THEN
      RANK = RANK + 1
    END IF
  END DO

  IF (IS_DEBUG) THEN
    print *, "EIG = ", EIG
    print *, "RANK = ", RANK
  END IF

  DEALLOCATE( WORK )
  DEALLOCATE( EIG )
  DEALLOCATE( ATA )

  IF (RANK < m) THEN
    INFO = 2 !Ошибка №2 - rank A < m
    RETURN
  END IF

  !Выделение памяти для массивов, необходимых для симплекс-метода
  ALLOCATE( S0(m+1) )
  ALLOCATE( ST(m+1, m+n+1) )

  !Вычисление коэффициента M
  KM = SUM( ABS(c) ) * (-2)

  !Вычисление оценок замещения
  ALLOCATE( MV(m) )
  MV = KM
  ST(m+1, 2:m+1) = 0
  ST(m+1, m+2:m+n) = MATMUL( MV, A ) - c
  DEALLOCATE( MV )

  !Вычисление F(x)
  ST(m+1, 1) = SUM(KM*b)

  !Занесение в СТ информации о начальной угловой точке
  ST(1:m, 1) = b
  
  ST(1:m, 2:m+1) = 0
  DO i=1,m
      ST(i,i+1) = 1
  END DO

  ST(1:m,m+2:n+1) = A
  
  !Запись информации о начальных базисных переменных
  DO j=1,m
    BP(j) = j + n
  END DO
  
  !Определение, нужно ли улучшение начального плана, проверка ОДР на закрытость сверху
  NEED_BETTER = .FALSE.
  DO j=m+2,m+n+1
    IF (ST(m+1,j) < -1*eps) THEN
      NEED_BETTER = .TRUE.
      k = 0
      DO i=1,m
        IF (ST(i,j) < -1*eps .OR. (ST(i,j) <= eps .AND. ST(i,j) >= -1*eps)) THEN
          k = k + 1
        END IF
      END DO
      IF (k .EQ. m) THEN
        INFO = 6 !Ошибка №6 - ОДР не закрыта сверху
        RETURN
      END IF
    END IF
  END DO

  IF (IS_DEBUG) THEN
    print *, "Симплекс-таблица:"
    print *, ((ST(i,j), j=1,m+n+1), CHAR(10), i=1,m+1)
    print *, "Б:", BP
  END IF

  !Улучшение плана
  DO WHILE (NEED_BETTER)
    !Определение, является ли текущая угловая точка вырожденной
    VYR = .FALSE.
    DO i=1,m
      VYR = VYR .OR. (ST(i,1) <= eps .AND. ST(i,1) >= -1*eps)
      IF (VYR) THEN
        EXIT
      END IF
    END DO
    
    !Определение разрешающего столбца
    RK = 0
    DO j=2,m+n+1
      IF ( ( (RK .EQ. 0) .AND. (ST(m+1,j) < -1*eps) ) .OR. ( (ST(m+1,j) <= ST(m+1,RK)) ) ) THEN
        RK = j
      END IF
    END DO
    
    IF (RK .EQ. 0) THEN
      INFO = 3 !Ошибка №3 - ошибка определения разрешающего столбца
      RETURN
    END IF
    
    !Определение разрешающей строки
    RS = 0
    IF (VYR .EQV. .FALSE.) THEN
      !Случай, если текущая угловая точка не вырожденная
      DO i=1,m
        IF ( ( (RS .EQ. 0) .AND. (ST(i,RK) > eps) ) .OR. ( (ST(i,RK) > eps) .AND. ( ST(i,1)/ST(i,RK) <= ST(RS,1)/ST(RS,RK) ) ) ) THEN
          RS = i
        END IF
      END DO
    ELSE
      !Случай, если текущая угловая точка вырожденная
      ALLOCATE( LEX(m) )

      DO l=1,m
        LEX(l) = l
      END DO
      k = m

      DO j=1,m+n+1
        IF (k .EQ. 1) THEN
          EXIT
        END IF

        RS = 0
        DO i=1,m
          DO l=1,m
            IF ( ( LEX(l) .EQ. i ) .AND. ( ( (RS .EQ. 0) .AND. (ST(i,RK) > eps) ) .OR. ( (ST(i,RK) > eps) .AND. ( ST(i,j)/ST(i,RK) <= ST(RS,j)/ST(RS,RK) ) ) ) ) THEN
              RS = i
              EXIT
            ELSE IF ( LEX(l) .EQ. i ) THEN
              EXIT
            END IF
          END DO
        END DO

        DO l=1,m
          IF (LEX(l) > 0 .AND. (ST(LEX(l),j)/ST(LEX(l),RK) > ST(RS,j)/ST(LEX(l),RK) .OR. (ST(LEX(l), RK) < -1*eps .OR. (ST(LEX(l), RK) <= eps .AND. ST(LEX(l), RK) >= -1*eps)))) THEN
            LEX(l) = 0
            k = k - 1
          END IF
        END DO

        IF (IS_DEBUG) THEN
          print *, "LEX = ", LEX
        END IF
      END DO
      DEALLOCATE( LEX )
    END IF

    IF (RS .EQ. 0) THEN
      INFO = 4 !Ошибка №4 - ошибка определения разрешающей строки
      RETURN
    END IF
    
    !Изменение информации о базисных переменных
    IF (RK > m+1) THEN
      BP(RS) = RK-m-1
    ELSE
      BP(RS) = RK+n-1
    END IF

    !Нормирование разрешающей строки
    S0 = ST(:,RK)
    ST(RS,:) = ST(RS,:)/S0(RS)
    
    !Заполнение симплекс-таблицы
    DO i=1,m+1
      IF (i .EQ. RS) THEN
        CYCLE
      END IF
      DO j=1,m+n+1
        ST(i,j) = ST(i,j) - ST(RS,j)*S0(i)
      END DO
    END DO

    IF (IS_DEBUG) THEN
      print *, "Симплекс-таблица:"
      print *, ((ST(i,j), j=1,m+n+1), CHAR(10), i=1,m+1)
      print *, "Б:", BP
    END IF

    !Определение, нужно ли улучшение плана, проверка ОДР на закрытость сверху
    NEED_BETTER = .FALSE.
    DO j=2,m+n+1
      IF (ST(m+1,j) < -1*eps) THEN
        NEED_BETTER = .TRUE.
        k = 0
        DO i=1,m
          IF (ST(i,j) < -1*eps .OR. (ST(i,j) <= eps .AND. ST(i,j) >= -1*eps)) THEN
            k = k + 1
          END IF
        END DO
        IF (k .EQ. m) THEN
          INFO = 6 !Ошибка №6 - ОДР не закрыта сверху
          RETURN
        END IF
      END IF
    END DO
  END DO
  
  !Проверка ограничений на совместность и заполнение вектора X
  DO j=1,m
    IF (BP(j) > n .AND. (ST(j,1) > eps .OR. ST(j,1) < -1*eps)) THEN
      INFO = 5 !Ошибка №5 - ограничения несовместны
      RETURN
    ELSE IF (BP(j) <= n) THEN
      X(BP(j)) = ST(j,1)
    END IF
  END DO
  
  F = ST(m+1,1)
  
  !Освобождение памяти от массивов, необходимых для симплекс-метода
  DEALLOCATE( S0 )
  DEALLOCATE( ST )

  INFO = 0
  RETURN
END

!Решение двойственной задачи для канонической задачи максимизации
SUBROUTINE Dual(A, b, c, X, F, BP, m, n, eps, Y, G, INFO)
  IMPLICIT NONE
  EXTERNAL DGESV
  !Параметры процедуры
  INTEGER, INTENT(IN) :: m, n               !Размерности прямой задачи
  REAL(8), DIMENSION(m,n), INTENT(IN) :: A  !Матрица коэфициентов прямой задачи
  REAL(8), DIMENSION(m), INTENT(IN) :: b    !Вектор правых частей прямой задачи
  REAL(8), DIMENSION(n), INTENT(IN) :: c    !Вектор коэффициентов ЦФ прямой задачи
  REAL(8), DIMENSION(n), INTENT(IN) :: X    !Вектор результата прямой задачи
  REAL(8), INTENT(IN) :: F                  !Значение целевой функции прямой задачи в оптимальной точке
  INTEGER, DIMENSION(m), INTENT(IN) :: BP   !Вектор номеров базисных переменных
  REAL(8), INTENT(IN) :: eps                !Радиус нуля
  REAL(8), DIMENSION(m), INTENT(OUT) :: Y   !Вектор двойственных оценок
  REAL(8), INTENT(OUT) :: G                 !Значение целевой функции двойственной задачи в оптимальной точке
  INTEGER, INTENT(OUT) :: INFO              !Информация:
                                            ! 0 - все нормально;
                                            ! 10 - ошибка в расчетах;
                                            ! 11 - невозможно решить СЛАУ для нахождения двойственных оценок;
                                            ! др. - см. ошибки процедуры Simplex.

  !Переменные для расчета двойственных оценок
  REAL(8), ALLOCATABLE, DIMENSION(:,:) :: D
  REAL(8), ALLOCATABLE, DIMENSION(:,:) :: S
  REAL(8), ALLOCATABLE, DIMENSION(:) :: h
  !Прочие переменные
  INTEGER :: i, j
  INTEGER, ALLOCATABLE, DIMENSION(:) :: IPIV

  !Инициализация Y и G
  Y = 0
  G = 0
  
  !Расчет двойственных оценок с помощью СЛАУ
  ALLOCATE( D(m,m) )
  ALLOCATE( h(m) )
  ALLOCATE( IPIV(m) )

  DO j=1,m
    D(:,j) = A(:,BP(j))
    h(j) = c(BP(j))
  END DO
    
  D = TRANSPOSE( D )
    
  CALL DGESV( m, 1, D, m, IPIV, h, m, INFO )
    
  IF (INFO .NE. 0) THEN
    INFO = 11 !Ошибка №11 - невозможно решить СЛАУ
    RETURN
  END IF
    
  Y = h
    
  G = SUM( b*Y )
    
  DEALLOCATE( IPIV )
  DEALLOCATE( D )
  DEALLOCATE( h )

  IF ( (ABS(G - F) > eps) .OR. (G + 1.0 .EQ. G) ) THEN
    INFO = 10 !Ошибка расчета
    RETURN
  END IF
  
  INFO = 0
  RETURN
END

!Интервалы устойчивости для вектора b
SUBROUTINE Interv_of_stab(A, b, X, BP, m, n, eps, D, DB, INFO)
  IMPLICIT NONE
  EXTERNAL DGETRF, DGETRI
  !Параметры процедуры
  INTEGER, INTENT(IN) :: m, n                 !Размерности задачи
  REAL(8), DIMENSION(m,n), INTENT(IN) :: A    !Матрица коэффициентов ограничений прямой задачи
  REAL(8), DIMENSION(m), INTENT(IN) :: b      !Вектор правых частей ограничений прямой задачи
  INTEGER, DIMENSION(m), INTENT(IN) :: BP     !Вектор номеров базисных переменных
  REAL(8), DIMENSION(n), INTENT(IN) :: X      !Вектор оптимального решения прямой задачи
  REAL(8), INTENT(IN) :: eps                  !Радиус нуля
  REAL(8), DIMENSION(m,m) :: D                !Матрица структурных сдвигов
  REAL(8), DIMENSION(m,2), INTENT(OUT) :: DB  !Массив интервалов устойчивости для b
  INTEGER, INTENT(OUT) :: INFO                !Информация:
                                              ! 0 - все нормально;
                                              ! 1 - невозможно получить LU-разложение матрицы A;
                                              ! 2 - невозможно получить матрицу, обратную A.
  !Прочие переменные
  INTEGER :: i, j, k, l, LWORK
  INTEGER, ALLOCATABLE, DIMENSION(:) :: IPIV
  REAL(8), ALLOCATABLE, DIMENSION(:) :: WORK
  INTEGER, DIMENSION(m) :: BP2
  REAL(8), ALLOCATABLE, DIMENSION(:) :: X2
  REAL(8), ALLOCATABLE, DIMENSION(:) :: b2

  !Получение упорядоченного вектора номеров базисных переменных
  BP2 = BP
  DO i=1,m
    l = BP2(i)
    DO j=i,m
      IF (BP2(j) < BP2(i)) THEN
        k = BP2(i)
        BP2(i) = BP2(j)
        BP2(j) = k
      END IF
    END DO
  END DO
  
  !Нахождение матрицы структурных сдвигов
  DO j=1,m
    D(:,j) = A(:,BP2(j))
  END DO
  
  ALLOCATE( IPIV(m) )
  CALL DGETRF( m, m, D, m, IPIV, INFO )
  IF (INFO .NE. 0) THEN
    INFO = 1 !Ошибка №1 - невозможно получить LU-разложение матрицы A
    RETURN
  END IF

  LWORK = 2*m
  ALLOCATE( WORK(LWORK) )
  CALL DGETRI( m, D, m, IPIV, WORK, LWORK, INFO )
  IF (INFO .NE. 0) THEN
    INFO = 2 !Ошибка №2 - невозможно получить матрицу, обратную A
    RETURN
  END IF
  
  DEALLOCATE( WORK )
  DEALLOCATE( IPIV )
  
  !Нахождение интервалов устойчивости для b
  DO j=1,m
    !Нахождение db(j)-
    k = 0
    DO i=1,m
      IF (X(BP2(i)) <= 0) THEN
        CYCLE
      END IF
      IF ( (k .EQ. 0 .AND.  D(i,j) > eps) .OR. (D(i,j) > eps .AND. X(BP2(i))/D(i,j) < X(BP2(k))/D(k,i)) ) THEN
        k = i
      END IF
    END DO
    
    IF (k .EQ. 0) THEN
      DB(j,1) = b(j)
    ELSE
      DB(j,1) = b(j) - X(BP2(k))/D(k,j)
    END IF

    !Нахождение db(j)+
    k = 0
    DO i=1,m
      IF (X(BP2(i)) < eps) THEN
        CYCLE
      END IF
      IF ( (k .EQ. 0 .AND.  D(i,j) < -1*eps) .OR. ( D(i,j) < -1*eps .AND. ABS(X(BP2(i))/D(i,j)) < ABS(X(BP2(k))/D(k,j)) ) ) THEN
        k = i
      END IF
    END DO

    IF (k .EQ. 0) THEN
      DB(j,2) = b(j)
    ELSE
      DB(j,2) = b(j) + ABS(X(BP2(k))/D(k,j))
    END IF
  END DO
  
  !Проверка и коррекция интервалов
  ALLOCATE( X2(m) )
  ALLOCATE( b2(m) )

  DO i=1,m
    DO j=1,2
      b2 = b
      b2(i) = DB(i,j)
      X2 = MATMUL( D, b2 )
      DO l=1,m
        IF (X2(l) < -1*eps) THEN
          DB(i,j) = b(i)
        END IF
      END DO
    END DO
  END DO
  
  DEALLOCATE( X2 )
  DEALLOCATE( b2 )
  
  RETURN
END
