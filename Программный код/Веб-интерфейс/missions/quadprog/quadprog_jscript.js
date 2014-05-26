//Параметры
var MaxN = 15; //максимальная размерность пространства переменных
var MaxM = 15; //максимальное количество ограничений

//Переменные
var n, n1, n2, m, m1, m2, m3, A1, A2, b1, b2, c, Q,
    findmin, x2, x0, need_dual, X, F, Y, G, after_point;

x2 = new Array();
x0 = new Array();
c = new Array();
b1 = new Array();
b2 = new Array();
A1 = new Array();
A2 = new Array();
Q = new Array();
X = new Array();
Y = new Array();

//Создать формы для ввода данных
function SetInp2()
  {
    var inp_n, inp_n2, inp_m1, inp_m2, inp_m3,
        input2, c_cont, c_elem, x2_cont, x2_elem, x0_cont, x0_elem,
        ab_table, ab_tbody, ab_tr, ab_td, a_elem, b_elem, div,
        q_table, q_tbody, q_tr, q_td, q_elem,
        i, j;

    //Ввод n
    inp_n = document.getElementById('inp_n');
    n = parseInt(inp_n.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(n) || n < 2)
      {
        alert('n должно быть целым положительным числом, n > 1!');
        n = 4;
        inp_n.value = 4;
        return;
      }
    else if (n > MaxN)
      {
        alert('Максимальная размерность пространства переменных n = '+MaxN+'!');
        n = 4;
        inp_n.value = 4;
        return;
      }

    //Ввод n2
    inp_n2 = document.getElementById('inp_n2');
    n2 = parseInt(inp_n2.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(n2) || n2 < 0)
      {
        alert('n2 должно быть целым неотрицательным числом!');
        n2 = 0;
        inp_n2.value = 0;
        return;
      }
    if(n2 > n)
      {
        alert('Количество переменных, на которые не наложено условие неотрицательности, должно быть меньше либо равно общему их количеству!');
        n2 = 0;
        inp_n2.value = 0;
        return;
      }
    //Расчет n1
    n1 = n - n2

    //Ввод m1
    inp_m1 = document.getElementById('inp_m1');
    m1 = parseInt(inp_m1.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(m1) || m1 < 0)
      {
        alert('m1 должно быть целым неотрицательным числом!');
        m1 = 0;
        inp_m1.value = 0;
        return;
      }

    //Ввод m2
    inp_m2 = document.getElementById('inp_m2');
    m2 = parseInt(inp_m2.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(m2) || m2 < 0)
      {
        alert('m2 должно быть целым неотрицательным числом!');
        m2 = 3;
        inp_m2.value = 3;
        return;
      }

    //Ввод m3
    inp_m3 = document.getElementById('inp_m3');
    m3 = parseInt(inp_m3.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(m3) || m1 < 0)
      {
        alert('m3 должно быть целым неотрицательным числом!');
        m3 = 3;
        inp_m3.value = 3;
        return;
      }

    //Расчет m
    m = m1 + m2 + m3
    if (m > MaxM)
      {
        alert('Максимальное количество ограничений m = '+MaxM+'!');
        return;
      }

    //Создание формы ввода данных
    input2 = document.getElementById('input2');
    input2.innerHTML = '';

    //Максимизация или минимизация
    input2.innerHTML += "<div><select id='maxmin'><option value='0'>Максимизация</option><option value='1'>Минимизация</option></select></div>";
    input2.innerHTML += "<div style='height: 0.5cm;'>&nbsp;</div>";

    //форма ввода вектора c
    c_cont = document.createElement('div');
    c_cont.id = 'c_cont';
    c_cont.innerHTML = '<i>c</i> = <span style="font-size: 20px;">(</span>';
    for(j=1; j<=n; j++)
      {
        c_elem = document.createElement('input');
        c_elem.type='text';
        c_elem.id='c_elem'+j;
        c_elem.size=3;
        c_cont.appendChild(c_elem);

        c_elem = document.createElement('span');
        c_elem.innerHTML = '&nbsp;';
        c_cont.appendChild(c_elem);
      }
    input2.appendChild(c_cont);
    c_cont.innerHTML += '<span style="font-size: 20px;">)</span>';

    //форма ввода матрицы Q
    input2.innerHTML += "<div style='height: 0.5cm;'>&nbsp;</div>";
    q_table = document.createElement('table');
    q_table.cellSpacing = '0';
    //q_table.border = '1';
    q_tbody = document.createElement('tbody');
    for(i=1; i<=n; i++)
      {
        q_tr = document.createElement('tr');
        if(i == 1)
          {
            q_td = document.createElement('td');
            q_td.rowSpan = n;
            q_td.style.verticalAlign = 'middle';
            q_td.innerHTML = "<i>Q</i>&nbsp; = ";
            q_tr.appendChild(q_td);
          }
        for(j=1; j<=n; j++)
          {
            q_td = document.createElement('td');
            q_elem = document.createElement('input');
            if(i > j)
              {
                q_elem.setAttribute("readonly", "true");
              }
            else if(i < j)
              {
                q_elem.setAttribute("onblur", "set_symmetric(this, 'Q("+j+","+i+")');");
              }
            q_elem.type = 'text';
            q_elem.size = 3;
            q_elem.id = 'Q('+i+','+j+')';
            q_td.appendChild(q_elem);
            if(j == 1)
              {
                q_td.style.borderLeft = '2px solid black';
              }
            else if(j == n)
              {
                q_td.style.borderRight = '2px solid black';
              }
            q_tr.appendChild(q_td);
          }
        q_tbody.appendChild(q_tr);
      }

    q_table.appendChild(q_tbody);
    input2.appendChild(q_table);


    //форма ввода номеров j для x''(j)
    if(n2 > 0)
      {
        x2_cont = document.createElement('div');
        x2_cont.id = 'x2_cont';
        x2_cont.innerHTML = "Номера переменных, входящих в <i>x<sup>''</sup></i>:<br />";
        for(j=1; j<=n2; j++)
          {
            x2_elem = document.createElement('input');
            x2_elem.type='text';
            x2_elem.id='x2_elem'+j;
            x2_elem.size=2;
            x2_elem.maxlength=2;
            x2_cont.appendChild(x2_elem);

            x2_elem = document.createElement('span');
            x2_elem.innerHTML = '&nbsp;';
            x2_cont.appendChild(x2_elem);
          }
        input2.appendChild(x2_cont);
      }

    //форма ввода A и b
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
            ab_td.innerHTML = "<i>A</i><sub>1</sub> = ";
            ab_tr.appendChild(ab_td);
          }
        for(j=1; j<=n; j++)
          {
            ab_td = document.createElement('td');
            a_elem = document.createElement('input');
            a_elem.type = 'text';
            a_elem.size = 3;
            a_elem.id = 'A1('+i+','+j+')';
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
        if(i == 1)
          {
            ab_td = document.createElement('td');
            ab_td.rowSpan = m1;
            ab_td.style.verticalAlign = 'middle';
            ab_td.innerHTML = "&nbsp;<i>b</i><sub>1</sub> = ";
            ab_tr.appendChild(ab_td);
          }
        ab_td = document.createElement('td');
        b_elem = document.createElement('input');
        b_elem.type = 'text';
        b_elem.size = 3;
        b_elem.id = 'b1('+i+')';
        ab_td.appendChild(b_elem);
        ab_td.style.borderLeft = '2px solid black';
        ab_td.style.borderRight = '2px solid black';
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

    for(i=1; i<=m2; i++)
      {
        ab_tr = document.createElement('tr');
        if(i == 1)
          {
            ab_td = document.createElement('td');
            ab_td.rowSpan = m2;
            ab_td.style.verticalAlign = 'middle';
            ab_td.innerHTML = "<i>A</i><sub>2</sub> = ";
            ab_tr.appendChild(ab_td);
          }
        for(j=1; j<=n; j++)
          {
            ab_td = document.createElement('td');
            a_elem = document.createElement('input');
            a_elem.type = 'text';
            a_elem.size = 3;
            a_elem.id = 'A2('+i+','+j+')';
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
        if(i == 1)
          {
            ab_td = document.createElement('td');
            ab_td.rowSpan = m2;
            ab_td.style.verticalAlign = 'middle';
            ab_td.innerHTML = "&nbsp;<i>b</i><sub>2</sub> = ";
            ab_tr.appendChild(ab_td);
          }
        ab_td = document.createElement('td');
        b_elem = document.createElement('input');
        b_elem.type = 'text';
        b_elem.size = 3;
        b_elem.id = 'b2('+i+')';
        ab_td.appendChild(b_elem);
        ab_td.style.borderLeft = '2px solid black';
        ab_td.style.borderRight = '2px solid black';
        ab_tr.appendChild(ab_td);
        ab_tbody.appendChild(ab_tr);
        if(i == m2)
          {
            ab_tr = document.createElement('tr');
            ab_td = document.createElement('td');
            ab_td.setAttribute('colspan', n+3);
            ab_td.innerHTML = '&nbsp;';
            ab_tr.appendChild(ab_td);
            ab_tbody.appendChild(ab_tr);
          }
      }

    for(i=1; i<=m3; i++)
      {
        ab_tr = document.createElement('tr');
        if(i == 1)
          {
            ab_td = document.createElement('td');
            ab_td.rowSpan = m3;
            ab_td.style.verticalAlign = 'middle';
            ab_td.innerHTML = "<i>A</i><sub>3</sub> = ";
            ab_tr.appendChild(ab_td);
          }
        for(j=1; j<=n; j++)
          {
            ab_td = document.createElement('td');
            a_elem = document.createElement('input');
            a_elem.type = 'text';
            a_elem.size = 3;
            a_elem.id = 'A3('+i+','+j+')';
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
        if(i == 1)
          {
            ab_td = document.createElement('td');
            ab_td.rowSpan = m3;
            ab_td.style.verticalAlign = 'middle';
            ab_td.innerHTML = "&nbsp;<i>b</i><sub>3</sub> = ";
            ab_tr.appendChild(ab_td);
          }
        ab_td = document.createElement('td');
        b_elem = document.createElement('input');
        b_elem.type = 'text';
        b_elem.size = 3;
        b_elem.id = 'b3('+i+')';
        ab_td.appendChild(b_elem);
        ab_td.style.borderLeft = '2px solid black';
        ab_td.style.borderRight = '2px solid black';
        ab_tr.appendChild(ab_td);
        ab_tbody.appendChild(ab_tr);
        if(i == m3)
          {
            ab_tr = document.createElement('tr');
            ab_td = document.createElement('td');
            ab_td.setAttribute('colspan', n+3);
            ab_td.innerHTML = '&nbsp;';
            ab_tr.appendChild(ab_td);
            ab_tbody.appendChild(ab_tr);
          }
      }
    ab_table.appendChild(ab_tbody);
    input2.appendChild(ab_table);

    div = document.createElement("div");
    div.style.marginBottom = '10px';
    div.innerHTML = "Число&nbsp;знаков&nbsp;после&nbsp;точки:&nbsp;<input type='text' size='3' id='after_point' value='3'><br />";
    input2.appendChild(div);
    
    x0_cont = document.createElement('div');
    x0_cont.id = 'c_cont';
    x0_cont.innerHTML = "Начальное приближение:<br>";
    x0_cont.innerHTML += '<i>x</i><sup>0</sup> = <span style="font-size: 20px;">(</span>';
    for(j=1; j<=n; j++)
      {
        x0_elem = document.createElement('input');
        x0_elem.type='text';
        x0_elem.id='x0_elem'+j;
        x0_elem.size=3;
        x0_cont.appendChild(x0_elem);
        x0_elem.value='0';

        x0_elem = document.createElement('span');
        x0_elem.innerHTML = '&nbsp;';
        x0_cont.appendChild(x0_elem);
      }
    x0_cont.innerHTML += '<span style="font-size: 20px;">)<sup>T</sup></span>';
    input2.appendChild(x0_cont);

    input2.innerHTML += "<div style='height: 10px'>&nbsp;</div>";
    input2.innerHTML += "<input type='button' value='Далее &rarr;' onclick='QuadProgGo();' />";
    input2.innerHTML += "<div style='height: 0.5cm;'>&nbsp;</div>";
  }

//Заполнить симметричный элемент
function set_symmetric(oThis, symID)
  {
    document.getElementById(symID).value = oThis.value;
  }

//Провести расчет
function QuadProgGo()
  {
    var model_div, mxmn, x2_elem, x0_elem, c_elem, b_elem,
        ab_table, ab_tbody, ab_tr, ab_td, a_elem,
        XML, POST, Answer, q_elem,
        i, j, l, k;

    //Максимум или минимум
    mxmn = document.getElementById('maxmin');
    if(mxmn.value == '1')
      {
        findmin = true;
      }
    else
      {
        findmin = false;
      }

    //Заполнение x2
    for(j=0; j<n2; j++)
      {
        x2_elem = document.getElementById('x2_elem'+(j+1));
        x2[j] = parseInt(x2_elem.value.replace(/(^\s+)|(\s+$)/g, ""));
        if(isNaN(x2[j]) || x2[j] > n)
          {
            alert('Номера переменных x\'\' должны быть целыми числами и не должны превосходить n!');
            return;
          }
      }

    //Заполнение x0
    for(j=0; j<n; j++)
      {
        x0_elem = document.getElementById('x0_elem'+(j+1));
        x0[j] = parseInt(x0_elem.value.replace(/(^\s+)|(\s+$)/g, ""));
        if(isNaN(x0[j]))
          {
            alert('Вектор x0 должен содержать только действительные числа!');
            return;
          }
      }

    //Заполнение c
    n = n1 + n2;

    l = 0;
    for(j=0; j<n; j++)
      {
        c_elem = document.getElementById('c_elem'+(j+1));
        c[j] = parseFloat(c_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
        if(isNaN(c[j]))
          {
            alert('Вектор c должен содержать только действительные числа!');
            return;
          }
      }
      
    if(!findmin)
      {
        for(j=0; j<n; j++)
          {
            c[j] = -1*c[j];
          }
      }
      
    //Заполнение матрицы Q
    for(i=0; i<n; i++)
      {
        Q[i] = new Array();
      }

    for(i=0; i<n; i++)
      {
        for(j=i; j<n; j++)
          {
            q_elem = document.getElementById('Q('+(i+1)+','+(j+1)+')');
            Q[i][j] = parseFloat(q_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
            if(isNaN(Q[i][j]))
              {
                alert('Матрица Q должна содержать только действительные числа!');
                return;
              }
            Q[j][i] = Q[i][j];
          }
      }

    //Заполнение вектора b1
    for(i=0; i<m1; i++)
      {
        b_elem = document.getElementById('b1('+(i+1)+')');
        b1[i] = parseFloat(b_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
        if(isNaN(b1[i]))
          {
            alert('Вектор b1 должен содержать только действительные числа!');
            return;
          }
      }

    //Заполнение вектора b2
    for(i=0; i<m2; i++)
      {
        b_elem = document.getElementById('b2('+(i+1)+')');
        b2[i] = parseFloat(b_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
        if(isNaN(b2[i]))
          {
            alert('Вектор b2 должен содержать только действительные числа!');
            return;
          }
      }

    for(i=0; i<m3; i++)
      {
        b_elem = document.getElementById('b3('+(i+1)+')');
        b2[m2+i] = parseFloat(b_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
        if(isNaN(b2[m2+i]))
          {
            alert('Вектор b3 должен содержать только действительные числа!');
            return;
          }
        b2[m2+i] *= -1;
      }
    
    //Обработка матрицы A1
    for(i=0; i<m1; i++)
      {
        A1[i] = new Array();
        for(j=0; j<n; j++)
          {
            a_elem = document.getElementById('A1('+(i+1)+','+(j+1)+')');
            A1[i][j] = parseFloat(a_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
            if(isNaN(A1[i][l]))
              {
                alert('Матрица A1 должна содержать только действительные числа!');
                return;
              }
          }
      }

    //Обработка матрицы A2
    for(i=0; i<m2; i++)
      {
        A2[i] = new Array();
        for(j=0; j<n; j++)
          {
            a_elem = document.getElementById('A2('+(i+1)+','+(j+1)+')');
            A2[i][j] = parseFloat(a_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
            if(isNaN(A2[i][j]))
              {
                alert('Матрица A2 должна содержать только действительные числа!');
                return;
              }
          }
      }

    for(i=0; i<m3; i++)
      {
        A2[m2+i] = new Array();
        for(j=0; j<n; j++)
          {
            a_elem = document.getElementById('A3('+(i+1)+','+(j+1)+')');
            A2[m2+i][j] = parseFloat(a_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
            if(isNaN(A2[m2+i][j]))
              {
                alert('Матрица A3 должна содержать только действительные числа!');
                return;
              }
            A2[m2+i][j] *= -1;
          }
      }
    
    //Создание XML для отправки на сервер
    XML = "<"+"?xml version='1' encoding='utf-8'?"+">\n";
    XML += "<quadprog>\n";
    XML += "  <m1>"+m1+"</m1>\n";
    XML += "  <m2>"+(m2+m3)+"</m2>\n";
    XML += "  <n>"+n+"</n>\n";
    XML += "  <n2>"+n2+"</n2>\n";
    XML += "  <eps>0.00001</eps>\n";
    XML += "  <findmin>"+(findmin ? '1' : '0')+"</findmin>\n";
    XML += "  <vect_x2>\n";
    for(j=0; j<n2; j++)
      {
        XML += "    <x2 j='"+(j+1)+"'>"+x2[j]+"</x2>\n";
      }
    XML += "  </vect_x2>\n";
    XML += "  <vect_x0>\n";
    for(j=0; j<n; j++)
      {
        XML += "    <x0 j='"+(j+1)+"'>"+x0[j]+"</x0>\n";
      }
    XML += "  </vect_x0>\n";
    XML += "  <vect_c>\n";
    for(j=0; j<n; j++)
      {
        XML += "    <c j='"+(j+1)+"'>"+c[j]+"</c>\n";
      }
    XML += "  </vect_c>\n";
    XML += "  <mat_Q>\n";
    for(i=0; i<n; i++)
      {
        for(j=i; j<n; j++)
          {
            XML += "   <q i='"+(i+1)+"' j='"+(j+1)+"'>"+Q[i][j]+"</q>\n";
          }
      }
    XML += "  </mat_Q>\n";
    XML += "  <mat_A1>\n";
    for(i=0; i<m1; i++)
      {
        for(j=0; j<n; j++)
          {
            XML += "   <a1 i='"+(i+1)+"' j='"+(j+1)+"'>"+A1[i][j]+"</a1>\n";
          }
      }
    XML += "  </mat_A1>\n";
    XML += "  <vect_b1>\n";
    for(i=0; i<m1; i++)
      {
        XML += "    <b1 i='"+(i+1)+"'>"+b1[i]+"</b1>\n";
      }
    XML += "  </vect_b1>\n";
    XML += "  <mat_A2>\n";
    for(i=0; i<m2+m3; i++)
      {
        for(j=0; j<n; j++)
          {
            XML += "   <a2 i='"+(i+1)+"' j='"+(j+1)+"'>"+A2[i][j]+"</a2>\n";
          }
      }
    XML += "  </mat_A2>\n";
    XML += "  <vect_b2>\n";
    for(i=0; i<m2+m3; i++)
      {
        XML += "    <b2 i='"+(i+1)+"'>"+b2[i]+"</b2>\n";
      }
    XML += "  </vect_b2>\n";
    XML += "</quadprog>\n";
    
    //Отправка запроса
    POST = encodeURIComponent(XML);
    document.getElementById('output').innerHTML = "<img src='/diplom/images/ajax-loader.gif' alt='Loading' width='66' height='66' style='display: block; margin: 0 auto;' />";
    AjaxPOST('/cgi-bin/quadprog.cgi', POST, 'alert(ajax_request.responseText)');
  }

//Обработка ответа
function Answer(resp)
  {
    var output, p, c, info, zstring, zarray, div, after_point_inp,
        dstring, dbstring, p1, c1, table, tbody, tr, td;
    
    output = document.getElementById('output');
    output.innerHTML = "<h1 style='margin-top: 20px;'>Ответ</h1>";
    
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
              output.innerHTML += "<b>Ошибка решения прямой задачи! Ранг матрицы A меньше числа ограниений (имеются линейно зависимые ограничения).</b>";
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

    if(zarray.length != nn)
      {
        output.innerHTML += "<b>Ошибка в полученных данных!</b>";
        return;
      }

    for(j=0; j<nn; j++)
      {
        Z[j] = parseFloat(zarray[j]);
        /*if(isNaN(Z[j]))
          {
            Z[j] = 0;
          }*/
      }

    output.innerHTML += "<h2>Решение прямой задачи</h2>";
    if(show_model)
      {
        div = document.createElement('div');
        div.innerHTML = "<i>z</i><sup>*</sup> = (";
        for(j=0; j<nn; j++)
          {
            div.innerHTML += Math.round(Z[j]*Math.pow(10, after_point))/Math.pow(10, after_point);
            if(j < nn-1)
              {
                div.innerHTML += "&nbsp;&nbsp;";
              }
          }
        div.innerHTML += ")<sup>T</sup>";
        output.appendChild(div);
      }
      
    //Заполнение BP
    p = resp.indexOf("<BP>") + 4;
    c = resp.indexOf("</BP>") - p;
    zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
    zstring = zstring.replace(/\s+/g, ' ');
    zarray = zstring.split(' ');

    if(zarray.length != m)
      {
        output.innerHTML += "<b>Ошибка в полученных данных!</b>";
        return;
      }

    for(i=0; i<m; i++)
      {
        BP[i] = parseInt(zarray[i]);
        /*if(isNaN(BP[i]))
          {
            BP[i] = 0;
          }*/
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
    for(j=0; j<n; j++)
      {
        if(n2 == 0)
          {
            X[j] = Z[k];
            k++;
          }

        for(i=0; i<n2; i++)
          {
            if(j+1 == x2[i])
              {
                X[j] = Z[k] - Z[k+1];
                k += 2;
                break;
              }
            else if(i == n2-1)
              {
                X[j] = Z[k];
                k++;
              }
          }
      }
    div = document.createElement('div');
    div.innerHTML = "<i>x</i>";
    if(!findmin)
      {
        div.innerHTML += "<sup>*</sup>";
      }
    else
      {
        div.innerHTML += "<sub>*</sub>";
      }
    div.innerHTML += " = (";
    for(j=0; j<n; j++)
      {
        div.innerHTML += Math.round(X[j]*Math.pow(10, after_point))/Math.pow(10, after_point);
        if(j < n-1)
          {
            div.innerHTML += "&nbsp;&nbsp;";
          }
      }
    div.innerHTML += ")<sup>T</sup>";
    output.appendChild(div);
    
    //Определение F(x)
    p = resp.indexOf("<F>") + 3;
    c = resp.indexOf("</F>") - p;
    F = parseFloat(resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, ''));

    output.innerHTML += "<i>f</i>(<i>x</i>";
    if(!findmin)
      {
        output.innerHTML += "<sup>*</sup>";
      }
    else
      {
        output.innerHTML += "<sub>*</sub>";
      }
    output.innerHTML += ") = " + Math.round(F*Math.pow(10, after_point))/Math.pow(10, after_point);

    //Заполнение Y
    if(need_dual)
      {
        p = resp.indexOf("<Y>") + 3;
        c = resp.indexOf("</Y>") - p;
        zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
        zstring = zstring.replace(/\s+/g, ' ');
        zarray = zstring.split(' ');

        if(zarray.length != m)
          {
            output.innerHTML += "<b>Ошибка в полученных данных!</b>";
            return;
          }

        for(i=0; i<m; i++)
          {
            Y[i] = parseFloat(zarray[i]);
            /*if(isNaN(Y[i]))
              {
                Y[i] = 0;
              }*/
          }

        output.innerHTML += "<h2 style='margin-top: 10px;'>Решение двойственной задачи</h2>";
        div = document.createElement('div');
        div.innerHTML = "<i>y</i>";
        if(findmin)
          {
            div.innerHTML += "<sup>*</sup>";
          }
        else
          {
            div.innerHTML += "<sub>*</sub>";
          }
        div.innerHTML += " = (";
        for(i=0; i<m; i++)
          {
            div.innerHTML += Math.round(Y[i]*Math.pow(10, after_point))/Math.pow(10, after_point);
            if(i < m-1)
              {
                div.innerHTML += "&nbsp;&nbsp;";
              }
          }
        div.innerHTML += ")<sup>T</sup>";
        output.appendChild(div);

        //Определение G(y)
        p = resp.indexOf("<G>") + 3;
        c = resp.indexOf("</G>") - p;
        G = parseFloat(resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, ''));

        output.innerHTML += "<i>g</i>(<i>y</i>";
        if(findmin)
          {
            output.innerHTML += "<sup>*</sup>";
          }
        else
          {
            output.innerHTML += "<sub>*</sub>";
          }
        output.innerHTML += ") = " + Math.round(G*Math.pow(10, after_point))/Math.pow(10, after_point);
      }

    if(need_interv)
      {
        //Получение D
        p = resp.indexOf("<D>") + 3;
        c = resp.indexOf("</D>") - p;
        zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
        zarray = zstring.split('\n');
        for(i=0; i<m; i++)
          {
            dstring = zarray[i+1].replace(/^\s+|\s+$|^\n+|\n+$/g, '');
            dstring = dstring.replace(/\s+/g, ' ');
            D[i] = new Array();
            D[i] = dstring.split(' ');
            if(D[i].length != m)
              {
                output.innerHTML += "<p><b>Ошибка в полученных данных!</b></p>";
                return;
              }
          }

        //Получение DB
        p = resp.indexOf("<intervals>") + 11;
        c = resp.indexOf("</intervals>") - p;
        zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
        p = -1;
        for(i=0; i<m; i++)
          {
            p = zstring.indexOf("<i>", p+1) + 3;
            c = zstring.indexOf("</i>", p) - p;
            dstring = zstring.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
            if(i != parseInt(dstring) && false)
              {
                output.innerHTML += "<p><b>Ошибка в полученных данных!</b></p>";
                return;
              }
            p1 = dstring.indexOf('<bm>') + 4;
            c1 = dstring.indexOf('</bm>') - p1;
            DB[i] = new Array();
            DB[i][0] = parseFloat(dstring.substr(p1, c1).replace(/^\s+|\s+$|^\n+|\n+$/g, ''));
            p1 = dstring.indexOf('<bp>') + 4;
            c1 = dstring.indexOf('</bp>') - p1;
            DB[i][1] = parseFloat(dstring.substr(p1, c1).replace(/^\s+|\s+$|^\n+|\n+$/g, ''));
          }

        output.innerHTML += "<h2 style='margin-top: 10px;'>Исследование задачи на чувствительность</h2>";
        output.innerHTML += "<p><b>Интервалы устойчивости</b></p>";

        table = document.createElement('table');
        tbody = document.createElement('tbody');

        for(i=0; i<m; i++)
          {
            tr = document.createElement('tr');
            td = document.createElement('td');
            td.innerHTML = Math.round(DB[i][0]*Math.pow(10, after_point))/Math.pow(10, after_point);
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = "&nbsp&le;&nbsp;";
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = "<i>b</i><sub>" + (i+1) + "</sub>";
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = "&nbsp&le;&nbsp;";
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = Math.round(DB[i][1]*Math.pow(10, after_point))/Math.pow(10, after_point);
            tr.appendChild(td);
            tbody.appendChild(tr);
          }
        table.appendChild(tbody);
        output.appendChild(table);

        CreateDForm(output, after_point);
        div = document.createElement('div');
        div.style.marginTop = '10px';
        div.innerHTML = "F<sup>'</sup> = <span id='intf'>"+(Math.round(F*Math.pow(10, after_point))/Math.pow(10, after_point))+"</span>; &#916;F = <span id='intdf'>0</span>";
        output.appendChild(div);
      }
  }


//Создание формы для исследования задачи на чувствительность
function CreateDForm(output, after_point)
  {
    var ab_table, ab_tbody, ab_tr, ab_td, inp;

    output.innerHTML += "<div style='height: 10px;'>&nbsp;</div>";
    output.innerHTML += "<p><b>Исследование задачи</b></p>";
    ab_table = document.createElement('table');
    ab_table.cellSpacing = '0';
    ab_table.cellPadding = '5';
    ab_tbody = document.createElement('tbody');
    for(i=1; i<=m; i++)
      {
        ab_tr = document.createElement('tr');
        for(j=1; j<=m; j++)
          {
            ab_td = document.createElement('td');
            ab_td.innerHTML = Math.round(D[i-1][j-1]*Math.pow(10, after_point))/Math.pow(10, after_point);
            if(j == 1)
              {
                ab_td.style.borderLeft = '2px solid black';
              }
            else if(j == m)
              {
                ab_td.style.borderRight = '2px solid black';
              }
            ab_tr.appendChild(ab_td);

            if(j == m)
              {
                if(i == 1)
                  {
                    ab_td = document.createElement('td');
                    ab_td.rowSpan = m;
                    ab_td.verticalAlign = 'middle';
                    ab_td.innerHTML = '&nbsp;*&nbsp;';
                    ab_tr.appendChild(ab_td);
                  }
                ab_td = document.createElement('td');
                inp = document.createElement('input');
                inp.type = 'text';
                inp.id = 'db' + i;
                inp.size = 3;
                inp.value = Math.round(b[i-1]*Math.pow(10, after_point))/Math.pow(10, after_point);
                ab_td.appendChild(inp);
                ab_td.style.borderLeft = '2px solid black';
                ab_td.style.borderRight = '2px solid black';
                ab_tr.appendChild(ab_td);
                if(i == 1)
                  {
                    ab_td = document.createElement('td');
                    ab_td.rowSpan = m;
                    ab_td.verticalAlign = 'middle';
                    ab_td.innerHTML = '<input type="button" value="&nbsp;=&nbsp;" onclick="NewX();" />';
                    ab_tr.appendChild(ab_td);
                  }
              }
          }
        ab_td = document.createElement('td');
        ab_td.id = 'dx' + BP[i-1];
        ab_td.style.borderLeft = '2px solid black';
        ab_td.style.borderRight = '2px solid black';
        ab_td.innerHTML = Math.round(Z[BP[i-1]-1]*Math.pow(10, after_point))/Math.pow(10, after_point);
        ab_tr.appendChild(ab_td);
        ab_tbody.appendChild(ab_tr);
      }

    ab_table.appendChild(ab_tbody);
    output.appendChild(ab_table);
    return;
  }

//Расчет новых X и F
function NewX()
  {
    var newB, inp, i, j, nx, nf;
    
    newB = new Array();
    for(i=0; i<m; i++)
      {
        inp = document.getElementById('db'+(i+1));
        newB[i] = parseFloat(inp.value);
      }

    nf = 0;
    for(i=0; i<m; i++)
      {
        nx = 0;
        for(j=0; j<m; j++)
          {
            nx += D[i][j]*newB[j];
          }
        document.getElementById('dx'+(BP[i])).innerHTML = Math.round(nx*Math.pow(10, after_point))/Math.pow(10, after_point);
        nf += c[BP[i]-1]*nx;
      }
    document.getElementById('intf').innerHTML = Math.round(nf*Math.pow(10, after_point))/Math.pow(10, after_point);
    document.getElementById('intdf').innerHTML = Math.round((nf-F)*Math.pow(10, after_point))/Math.pow(10, after_point);
  }
