//Параметры
var MaxN = 10; //максимальная размерность пространства переменных
var MaxM = 10; //максимальное количество ограничений

//Переменные
var n, n1, n2, m, m1, m2, m3, A, B, C, nn,
    findmin, x2, show_model, need_dual, need_interv,
    Z, BP, X, F, Y, G, D, DB, after_point;

x2 = new Array();
C = new Array();
B = new Array();
A = new Array();
Z = new Array();
BP = new Array();
X = new Array();
Y = new Array();
D = new Array();
DB = new Array();

//Создать формы для ввода данных
function SetInp2()
  {
    var inp_n, inp_n2, inp_m1, inp_m2, inp_m3,
        input2, c_cont, c_elem, x2_cont, x2_elem,
        ab_table, ab_tbody, ab_tr, ab_td, a_elem, b_elem, div,
        i, j;

    //Ввод n
    inp_n = document.getElementById('inp_n');
    n = parseInt(inp_n.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(n) || n < 2)
      {
        alert('n должно быть целым положительным числом, n > 1!');
        n = 3;
        inp_n.value = 3
        return;
      }
    else if (n > MaxN)
      {
        alert('Максимальное количество потребителей n = '+MaxN+'!');
        n = 3;
        inp_n.value = 3;
        return;
      }

    //Ввод m1
    m1 = n;

    //Создание формы ввода данных
    input2 = document.getElementById('input2');
    input2.innerHTML = '';

    //форма ввода С, a и b
    input2.innerHTML += "<div style='height: 0.5cm;'>&nbsp;</div>";
    ab_table = document.createElement('table');
    ab_table.cellSpacing = '0';
    //ab_table.border = '1';
    ab_tbody = document.createElement('tbody');
    for(i=1; i<=m1; i++)
      {
        ab_tr = document.createElement('tr');
        if(i == 1)
          {
            ab_td = document.createElement('td');
            ab_td.rowSpan = m1;
            ab_td.style.verticalAlign = 'middle';
            ab_td.innerHTML = "<i>C</i> = ";
            ab_tr.appendChild(ab_td);
          }
        for(j=1; j<=n; j++)
          {
            ab_td = document.createElement('td');
            a_elem = document.createElement('input');
            a_elem.type = 'text';
            a_elem.size = 3;
            a_elem.id = 'C('+i+','+j+')';
            ab_td.appendChild(a_elem);
            if(j == 1)
              {
                ab_td.style.borderLeft = '2px solid black';
              }
            else if(j == n)
              {
                ab_td.style.borderRight = '2px solid black';
              }
            ab_tr.appendChild(ab_td);
          }

        ab_td = document.createElement('td');
        b_elem = document.createElement('input');
        b_elem.type = 'hidden';
        b_elem.id = 'a('+i+')';
        b_elem.value = 1;
        ab_td.appendChild(b_elem);
        ab_tr.appendChild(ab_td);
        ab_tbody.appendChild(ab_tr);
        if(i == m1)
          {
            ab_tr = document.createElement('tr');
            ab_td = document.createElement('td');
            ab_td.setAttribute('colspan', n+3);
            ab_td.innerHTML = '&nbsp;';
            ab_tr.appendChild(ab_td);
            ab_tbody.appendChild(ab_tr);
          }
      }
      ab_tr = document.createElement('tr');

      for(j=1; j<=n; j++)
        {
            ab_td = document.createElement('td');
            a_elem = document.createElement('input');
            a_elem.type = 'hidden';
            a_elem.id = 'B('+j+')';
            a_elem.value = 1;
            ab_td.appendChild(a_elem);
            ab_tr.appendChild(ab_td);
        }
    ab_td = document.createElement('td');
    ab_td.innerHTML = "&nbsp;";
    ab_td.colSpan = 2;
    ab_tr.appendChild(ab_td);
    
    ab_tbody.appendChild(ab_tr);

    ab_table.appendChild(ab_tbody);
    input2.appendChild(ab_table);
    
    div = document.createElement("div");
    div.style.marginBottom = '10px';
    input2.appendChild(div);

    div = document.createElement("div");
    div.style.marginBottom = '10px';
    div.innerHTML = "<input type='hidden' id='after_point' value='0'>";
    input2.appendChild(div);

    input2.innerHTML += "<input type='button' value='Далее &rarr;' onclick='TranspGo();' />";
    input2.innerHTML += "<div style='height: 0.5cm;'>&nbsp;</div>";
  }

//Провести расчет
function TranspGo()
  {
    var model_div, mxmn, x2_elem, c_elem, b_elem,
        ab_table, ab_tbody, ab_tr, ab_td, a_elem,
        XML, POST, Answer,
        i, j, l, k, cm, sA, sB, needA, needB;

    //Максимум или минимум
    findmin = true;
    
    //Ввод A и B, открытая или закрытая задача?
    sA = 0;
    for(i=0; i<m1; i++)
      {
        a_elem = document.getElementById('a('+(i+1)+')');
        A[i] = parseFloat(a_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
        if(isNaN(A[i]) || (!isNaN(A[i]) && A[i] <= 0))
          {
            alert('Вектор A должен содержать только положительные действительные числа!');
            return;
          }
        sA += A[i];
      }

    sB = 0;
    for(j=0; j<n; j++)
      {
        b_elem = document.getElementById('B('+(j+1)+')');
        B[j] = parseFloat(b_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
        if(isNaN(B[j]) || (!isNaN(B[j]) && B[j] <= 0))
          {
            alert('Вектор B должен содержать только положительные действительные числа!');
            return;
          }
        sB += B[j];
      }

    needA = 0;
    needB = 0;
    nn = n;
    m = m1;
    if(sA < sB)
      {
        needA = sB - sA;
        m = m1 + 1;
        A[m-1] = needA;
      }
    else if(sA > sB)
      {
        needB = sA - sB;
        nn = n + 1;
        B[nn-1] = needB;
      }

    //Обработка матрицы C
    for(i=0; i<m1; i++)
      {
        C[i] = new Array();
        for(j=0; j<n; j++)
          {
            c_elem = document.getElementById('C('+(i+1)+','+(j+1)+')');
            C[i][j] = -1*parseFloat(c_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
            if(isNaN(C[i][j]) || (!isNaN(C[i][j]) && C[i][j] > 0))
              {
                alert('Матрица C должна содержать только неотрицательные действительные числа!');
                return;
              }

            if(needB > 0 && j == n-1)
              {
                C[i][j+1] = 0;
              }
          }
      }

    if(needA > 0)
      {
        C[m-1] = new Array();
        for(j=0; j<n; j++)
          {
            C[i][j] = 0;
          }
      }

var AND = "";

for(i=0; i<m; i++)
  {
    AND += A[i] + " ";
  }
AND += "\n";

for(j=0; j<nn; j++)
  {
    AND += B[j] + " ";
  }
AND += "\n";

for(i=0; i<m; i++)
  {
    for(j=0; j<nn; j++)
      {
        AND += C[i][j] + " ";
      }
    AND += "\n";
  }
//alert(AND);
      
    //Определение значений логических переменных
    show_model = false;
    need_dual = false;
    need_interv = false;

    //Вывод данных
    if(needA > 0 || needB > 0)
      {
        model_div = document.getElementById('model_div');
        model_div.innerHTML = "<h2>Примечения</h2>";
      }

    if(needA > 0)
      {
        model_div.innerHTML += "<p>Введен фиктивный поставщик <i>A</i><sub>"+m+"</sub>.</p>";
      }

    if(needB > 0)
      {
        model_div.innerHTML += "<p>Введен фиктивный потребитель <i>B</i><sub>"+nn+"</sub>.</p>";
      }

    //Создание XML для отправки на сервер
    XML = "<"+"?xml version='1' encoding='utf-8'?"+">\n";
    XML += "<linprog>\n";
    var p = m*nn;
    var v = m + nn - 1;
    XML += "  <m>"+v+"</m>\n";
    XML += "  <n>"+p+"</n>\n";
    XML += "  <eps>0.00001</eps>\n";
    XML += "  <findmin>1</findmin>\n";
    XML += "  <need_dual>0</need_dual>\n";
    XML += "  <need_intervals>0</need_intervals>\n";
    XML += "  <vect_c>\n";
    var l = 1;
    for(i=0; i<m; i++)
      {
        for(j=0; j<nn; j++)
          {
            XML += "    <c j='"+l+"'>"+C[i][j]+"</c>\n";
            l++;
          }
      }
    XML += "  </vect_c>\n";
    XML += "  <mat_A>\n";
    //Матрица коэффициентов ограничений
    var W = new Array();
    for(i=0; i<v; i++)
      {
        W[i] = new Array();
        for(j=0; j<p; j++)
          {
            W[i][j] = 0;
          }
      }

    l = 0;
    for(i=0; i<m; i++)
      {
        for(j=0; j<nn; j++)
          {
            W[i][j+l] = 1;
          }
        l += nn;
      }

    l = 0;
    var g = 0
    for(i=m; i<v; i++)
      {
        for(j=l; j<l+m; j++)
          {
            W[i][g] = 1;
            g += nn;
          }
        l++;
        g = l;
      }

    for(i=0; i<v; i++)
      {
        for(j=0; j<p; j++)
          {
            XML += "   <a i='"+(i+1)+"' j='"+(j+1)+"'>"+W[i][j]+"</a>\n";
          }
      }
    XML += "  </mat_A>\n";

    XML += "  <vect_b>\n";
    for(i=0; i<m; i++)
      {
        XML += "    <b i='"+(i+1)+"'>"+A[i]+"</b>\n";
      }
    for(i=m; i<v; i++)
      {
        XML += "    <b i='"+(i+1)+"'>"+B[i-m]+"</b>\n";
      }
    XML += "  </vect_b>\n";
    XML += "</linprog>\n";

    //Отправка запроса
    POST = encodeURIComponent(XML);
    document.getElementById('output').innerHTML = "<img src='/images/ajax-loader.gif' alt='Loading' width='66' height='66' style='display: block; margin: 0 auto;' />";
    AjaxPOST('/cgi-bin/linprog.cgi', POST, 'Answer(ajax_request.responseText)');
  }

//Обработка ответа
function Answer(resp)
  {
    var output, p, c, info, zstring, zarray, div, after_point_inp,
        dstring, dbstring, p1, c1, table, tbody, tr, td;
    
    output = document.getElementById('output');
    output.innerHTML = "<h1 style='margin-top: 20px;'>Матрица оптимальных назначений</h1>";
    
    if(resp.indexOf("<error mission='parse'>") > -1)
      {
        output.innerHTML += "<b>Ошибка! Были предоставлены некорректные исходные данные.</b>";
        return;
      }
    else if(resp.indexOf("<error mission='primal'>") > -1)
      {
        p = resp.indexOf("<error mission='primal'>") + 24;
        c = resp.indexOf("</error>") - p;
        info = parseInt(resp.substr(p, c));
        
        switch(info)
          {
            case 2:
              output.innerHTML += "<b>Ошибка решения прямой задачи! Ранг матрицы коэффициентов меньше числа ограниений (имеются линейно зависимые ограничения либо нулевой ряд).</b>";
            break;
            case 5:
              output.innerHTML += "<b>Ошибка решения прямой задачи! Ограничения не совместны.</b>";
            break;
            case 6:
              output.innerHTML += "<b>Ошибка решения прямой задачи! Область допустимых решений не ограничена.</b>";
            break;
            default:
              output.innerHTML += "<b>Ошибка решения прямой задачи ("+info+")! Попробуйте ввести другие данные.</b>";
            break;
          }
        return;
      }
    else if(resp.indexOf("<error mission='dual'>") > -1)
      {
        output.innerHTML += "<b>Ошибка решения двойственной задачи! Попробуйте ввести другие данные.</b>";
        return;
      }
    else if(resp.indexOf("<error mission='intervals'>") > -1)
      {
        output.innerHTML += "<b>Ошибка поиска интервалов устойчивости! Попробуйте ввести другие данные.</b>";
        return;
      }

    //Получение информации об округлении
    after_point_inp = document.getElementById('after_point');
    after_point = parseInt(after_point_inp.value);
    if(isNaN(after_point))
      {
        after_point = 0;
      }

    //Заполнение Z
    p = resp.indexOf("<X>") + 3;
    c = resp.indexOf("</X>") - p;
    zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
    zstring = zstring.replace(/\s+/g, ' ');
    zarray = zstring.split(' ');

    if(zarray.length != nn*m)
      {
        output.innerHTML += "<b>Ошибка в полученных данных: неправильное количество переменных!</b>";
        return;
      }

    for(j=0; j<nn*m; j++)
      {
        Z[j] = parseFloat(zarray[j]);
      }
      
    //Заполнение BP
    p = resp.indexOf("<BP>") + 4;
    c = resp.indexOf("</BP>") - p;
    zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
    zstring = zstring.replace(/\s+/g, ' ');
    zarray = zstring.split(' ');

    if(zarray.length != nn+m-1)
      {
        output.innerHTML += "<b>Ошибка в полученных данных: неправильное количество базисных переменных!</b>";
        return;
      }

    for(i=0; i<nn+m-1; i++)
      {
        BP[i] = parseInt(zarray[i]);
      }
      
    for(i=0; i<m; i++)
      {
        for(j=i; j<m; j++)
          {
            if(BP[j] <= BP[i])
              {
                p = BP[i];
                BP[i] = BP[j];
                BP[j] = p;
              }
          }
      }

    //Заполнение X
    k = 0;
    l = 0;
    for(i=0; i<m; i++)
      {
        X[i] = new Array();
        for(j=0; j<nn; j++)
          {
            X[i][j] = Z[l];
            l++;
          }
      }

    div = document.createElement('div');
    div.innerHTML = "";
    var ab_table = document.createElement('table');
    ab_table.cellSpacing = '0';
    ab_table.cellPadding = '10';
    var ab_tbody = document.createElement('tbody');
    l = 1;
    for(i=0; i<m; i++)
      {
        var ab_tr = document.createElement('tr');
        var ab_td;
        if(i == 0)
          {
            ab_td = document.createElement('td');
            ab_td.rowSpan = m;
            ab_td.style.verticalAlign = 'middle';
            ab_td.innerHTML = "<i>X</i> = ";
            ab_tr.appendChild(ab_td);
          }
        for(j=0; j<nn; j++)
          {
            ab_td = document.createElement('td');
            ab_td.style.verticalAlign = 'middle';
            ab_td.style.textAlign = 'center';
            if(X[i][j] == 0)
              {
                var in_basys = false;
                for(var g=0; g<m+nn-1; g++)
                  {
                    if(BP[g] == l)
                      {
                        in_basys = true;
                        break;
                      }
                  }

                if(in_basys)
                  {
                    ab_td.innerHTML = 0;
                  }
                else
                  {
                    ab_td.innerHTML = "<b>&middot;</b>";
                  }
              }
            else
              {
                ab_td.innerHTML = X[i][j];
              }

            l++;

            if(j == 0)
              {
                ab_td.style.borderLeft = '2px solid black';
              }
            else if(j == nn-1)
              {
                ab_td.style.borderRight = '2px solid black';
              }
            ab_tr.appendChild(ab_td);
          }

        ab_tbody.appendChild(ab_tr);
      }

    ab_table.appendChild(ab_tbody);
    div.appendChild(ab_table);
    output.appendChild(div);

    //Определение F(x)
    p = resp.indexOf("<F>") + 3;
    c = resp.indexOf("</F>") - p;
    F = parseFloat(resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, ''));

    output.innerHTML += "<br /><i>F</i>(<i>X</i>)&nbsp;=&nbsp;";
    output.innerHTML += -1*Math.round(F*Math.pow(10, after_point))/Math.pow(10, after_point);
  }
