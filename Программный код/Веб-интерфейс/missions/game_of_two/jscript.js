//Параметры
var MaxS = 20; //максимальное количество стратегий

//Переменные
var n, m, mm, H, A, B, after_point, Alp;

B = new Array();
A = new Array();
H = new Array();

//Создать формы для ввода данных
function SetInp2()
  {
    //Ввод n
    var inp_n = document.getElementById('inp_n');
    n = parseInt(inp_n.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(n) || n < 1)
      {
        alert('n должно быть целым положительным числом, n > 0!');
        n = 3;
        inp_n.value = 3
        return;
      }
    else if (n > MaxS)
      {
        alert('Максимальное количество стратегий = '+MaxS+'!');
        n = 3;
        inp_n.value = 3;
        return;
      }

    //Ввод m
    var inp_m = document.getElementById('inp_m');
    m = parseInt(inp_m.value.replace(/(^\s+)|(\s+$)/g, ""));
    if(isNaN(m) || m < 0)
      {
        alert('m должно быть целым неотрицательным числом!');
        m = 2;
        inp_m.value = 2;
        return;
      }

    //Создание формы ввода данных
    var input2 = document.getElementById('input2');
    input2.innerHTML = '';

    //форма ввода матрицы H
    input2.innerHTML += "<div style='height: 0.5cm;'>&nbsp;</div>";
    var h_table = document.createElement('table');
    h_table.cellSpacing = '0';
    //h_table.border = '1';
    var h_tbody = document.createElement('tbody');
    var h_tr, h_td, h_elem, i, j;
    for(i=1; i<=m; i++)
      {
        h_tr = document.createElement('tr');
        if(i == 1)
          {
            h_td = document.createElement('td');
            h_td.rowSpan = m;
            h_td.style.verticalAlign = 'middle';
            h_td.innerHTML = "<i>H</i>&nbsp;=&nbsp;";
            h_tr.appendChild(h_td);
          }

        for(j=1; j<=n; j++)
          {
            h_td = document.createElement('td');
            h_elem = document.createElement('input');
            h_elem.type = 'text';
            h_elem.size = 3;
            h_elem.id = 'H('+i+','+j+')';
            h_td.appendChild(h_elem);
            if(j == 1)
              {
                h_td.style.borderLeft = '2px solid black';
              }
            else if(j == n)
              {
                h_td.style.borderRight = '2px solid black';
              }
            h_tr.appendChild(h_td);
          }
        h_tbody.appendChild(h_tr);
      }

    h_table.appendChild(h_tbody);
    input2.appendChild(h_table);
    
    var div = document.createElement("div");
    div.style.marginBottom = '10px';
    div.innerHTML = "<br />Число&nbsp;знаков&nbsp;после&nbsp;точки:&nbsp;<input type='text' size='3' id='after_point' value='2'><br />";
    input2.appendChild(div);

    input2.innerHTML += "<input type='button' value='Далее &rarr;' onclick='GameGo();' />";
    input2.innerHTML += "<div style='height: 0.5cm;'>&nbsp;</div>";
  }

//Провести расчет
function GameGo()
  {
    //Заполнение матрицы H
    var i, j, h_elem;
    for(i=0; i<m; i++)
      {
        H[i] = new Array();
        for(j=0; j<n; j++)
          {
            h_elem = document.getElementById('H('+(i+1)+','+(j+1)+')');
            H[i][j] = parseFloat(h_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
            if(isNaN(H[i][j]))
              {
                alert('Матрица H должна содержать только действительные числа!');
                return;
              }
          }
      }

    //Попытка решить задачу в чистых стратегиях
    var is_clean = Clean();
    
    //Решение игры в смешанных стретегиях или выход
    if(is_clean)
      {
        return;
      }
    else
      {
        Smooth();
      }
  }

//Решение игры в чистых стратегиях
function Clean()
  {
    var minA, maxB, maxminA, minmaxB, oA, oB;
    minA = new Array();
    maxB = new Array();
    
    var i, j, t;
    for(i=0; i<m; i++)
      {
        t = 0;
        for(j=1; j<n; j++)
          {
            if(H[i][j] < H[i][t])
              {
                t = j;
              }
          }
        minA[i] = H[i][t];
      }
    
    t = 0;
    for(i=1; i<m; i++)
      {
        if(minA[i] > minA[t])
          {
            t = i;
          }
      }
    maxminA = minA[t];
    oA = t + 1;
    
    for(j=0; j<n; j++)
      {
        t = 0;
        for(i=1; i<m; i++)
          {
            if(H[i][j] > H[t][j])
              {
                t = i;
              }
          }
        maxB[j] = H[t][j];
      }

    t = 0;
    for(j=1; j<n; j++)
      {
        if(maxB[j] < maxB[t])
          {
            t = j;
          }
      }
    minmaxB = maxB[t];
    oB = t + 1;

    if(maxminA == minmaxB)
      {
        var output = document.getElementById('output');
        output.innerHTML = "<h1>Ответ</h1>";
        output.innerHTML += "<p>Найдено решение игры в чистых стратегиях.</p>";
        output.innerHTML += "<p>Оптимальная стратегия игрока <i>A</i> &mdash; <i>A</i><sub>"+oA+"</sub>.</p>";
        output.innerHTML += "<p>Оптимальная стратегия игрока <i>B</i> &mdash; <i>B</i><sub>"+oB+"</sub>.</p>";
        output.innerHTML += "<p>Цена игры <i>V</i> = "+maxminA+".</p>";
        
        return true;
      }
    else
      {
        return false;
      }
  }

//Решение игры в смешанных стратегиях
function Smooth()
  {
    //Создание матриц
    var i, j, t1, t2;
    t1 = 0;
    t2 = 0;
    for(i=0; i<m; i++)
      {
        for(j=0; j<n; j++)
          {
            if(H[i][j] < H[t1][t2])
              {
                t1 = i;
                t2 = j;
              }
          }
      }
    
    Alp = Math.abs(H[t1][t2]) + 1;
    
    mm = m + n;
    var W = new Array();

    for(j=0; j<n; j++)
      {
        W[j] = new Array();
        for(i=0; i<m; i++)
          {
            W[j][i] = H[i][j] + Alp;
          }
        for(i=m; i<mm; i++)
          {
            if(i == j+m)
              {
                W[j][i] = -1;
              }
            else
              {
                W[j][i] = 0;
              }
          }
      }

    //Создание XML для отправки на сервер
    XML = "<"+"?xml version='1' encoding='utf-8'?"+">\n";
    XML += "<linprog>\n";
    XML += "  <m>"+n+"</m>\n";
    XML += "  <n>"+mm+"</n>\n";
    XML += "  <eps>0.00001</eps>\n";
    XML += "  <findmin>1</findmin>\n";
    XML += "  <need_dual>1</need_dual>\n";
    XML += "  <need_intervals>0</need_intervals>\n";
    XML += "  <vect_c>\n";

    for(j=0; j<m; j++)
      {
        XML += "    <c j='"+(j+1)+"'>-1</c>\n";
      }
    for(j=m; j<mm; j++)
      {
        XML += "    <c j='"+(j+1)+"'>0</c>\n";
      }

    XML += "  </vect_c>\n";
    XML += "  <mat_A>\n";

    for(i=0; i<n; i++)
      {
        for(j=0; j<mm; j++)
          {
            XML += "   <a i='"+(i+1)+"' j='"+(j+1)+"'>"+W[i][j]+"</a>\n";
          }
      }

    XML += "  </mat_A>\n";
    XML += "  <vect_b>\n";
    for(i=0; i<n; i++)
      {
        XML += "    <b i='"+(i+1)+"'>1</b>\n";
      }

    XML += "  </vect_b>\n";
    XML += "</linprog>\n";



    //Отправка запроса
    POST = encodeURIComponent(XML);
    document.getElementById('output').innerHTML = "<img src='/images/ajax-loader.gif' alt='Loading' width='66' height='66' style='display: block; margin: 0 auto;' />";

    AjaxPOST('/cgi-bin/linprog.cgi', POST, 'SmoothAnswer(ajax_request.responseText)');
  }

//Обработка ответа - смешанные стратегии
function SmoothAnswer(resp)
  {
    var output = document.getElementById('output');
    output.innerHTML = "<h1 style='margin-top: 20px;'>Ответ</h1>";

    if(resp.indexOf("<error mission='parse'>") > -1)
      {
        output.innerHTML += "<b>Ошибка! Были предоставлены некорректные исходные данные.</b>";
        return;
      }
    else if(resp.indexOf("<error mission='primal'>") > -1)
      {
        var p = resp.indexOf("<error mission='primal'>") + 24;
        var c = resp.indexOf("</error>") - p;
        var info = parseInt(resp.substr(p, c));

        switch(info)
          {
            case 2:
              output.innerHTML += "<b>Ошибка решения прямой задачи! Ранг матрицы A меньше числа ограниений (имеются линейно зависимые ограничения либо нулевой ряд).</b>";
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
    var after_point_inp = document.getElementById('after_point');
    after_point = parseInt(after_point_inp.value);

    if(isNaN(after_point))
      {
        after_point = 0;
      }

    //Заполнение X
    var p = resp.indexOf("<X>") + 3;
    var c = resp.indexOf("</X>") - p;

    var zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
    zstring = zstring.replace(/\s+/g, ' ');
    var zarray = zstring.split(' ');

    if(zarray.length != mm)
      {
        output.innerHTML += "<b>Ошибка в полученных данных!</b>";
        return;
      }

    var X = new Array();
    for(j=0; j<m; j++)
      {
        X[j] = parseFloat(zarray[j]);
      }

    //Заполнение Y
    var p = resp.indexOf("<Y>") + 3;
    var c = resp.indexOf("</Y>") - p;
    zstring = resp.substr(p, c).replace(/^\s+|\s+$|^\n+|\n+$/g, '');
    zstring = zstring.replace(/\s+/g, ' ');
    zarray = zstring.split(' ');

    if(zarray.length != n)
      {
        output.innerHTML += "<b>Ошибка в полученных данных!</b>";
        return;
      }

    var Y = new Array();
    for(i=0; i<n; i++)
      {
        Y[i] = -1*parseFloat(zarray[i]);
      }

    //Расчет вероятностей
    var SX = 0;
    for(i=0; i<m; i++)
      {
        SX += X[i];
      }
    var V1 = 1/SX - Alp;
    
    var P = new Array();
    for(i=0; i<m; i++)
      {
        P[i] = X[i]/SX;
      }

    var SY = 0;
    for(j=0; j<n; j++)
      {
        SY += Y[j];
      }
    var V2 = 1/SY - Alp;

    var Q = new Array();
    for(j=0; j<n; j++)
      {
        Q[j] = Y[j]/SY;
      }

    //Вывод данных
    var output = document.getElementById('output');
    output.innerHTML = "<h1>Ответ</h1>";
    output.innerHTML += "<p>Найдено решение игры в смешанных стратегиях.</p>";
    var P_str = "";
    for(i=0; i<m; i++)
      {
        P_str += "" + Math.round(P[i]*Math.pow(10,after_point))/Math.pow(10,after_point);
        if(i < m-1)
          {
            P_str += "&nbsp;&nbsp;";
          }
      }
    output.innerHTML += "<p>Оптимальная стратегия игрока <i>A</i> &mdash; <i>P</i> = ("+P_str+").</p>";
    var Q_str = "";
    for(j=0; j<n; j++)
      {
        Q_str += "" + Math.round(Q[j]*Math.pow(10,after_point))/Math.pow(10,after_point);
        if(j < n-1)
          {
            Q_str += "&nbsp;&nbsp;";
          }
      }
    output.innerHTML += "<p>Оптимальная стратегия игрока <i>B</i> &mdash; <i>Q</i> = ("+Q_str+").</p>";
    output.innerHTML += "<p>Цена игры <i>V</i> = "+Math.round(V1, after_point)+".</p>";
  }
