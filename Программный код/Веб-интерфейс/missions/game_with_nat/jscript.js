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
    h_table.style.marginBottom = '3px';
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

    //Критерий Байеса
    if(document.getElementById('bayes').checked)
      {
        var p_div = document.createElement('div');
        p_div.style.margin = "10px 0 10px 0";
        p_div.innerHTML = "<i>P</i>&nbsp;=&nbsp;<span style='font-size: 16pt;'>(</span>";
        var p_elem;
        for(j=1; j<=n; j++)
          {
            p_elem = document.createElement('input');
            p_elem.type = "text";
            p_elem.size = 3;
            p_elem.id = "p(" + j + ")";
            p_div.appendChild(p_elem);
            if(j < n)
              {
                p_div.innerHTML += " ";
              }
          }
        p_div.innerHTML += "<span style='font-size: 16pt;'>)</span>";
        input2.appendChild(p_div);
      }

    //Критерий Гурвица
    if(document.getElementById('gurvits').checked)
      {
        var p_div = document.createElement('div');
        p_div.style.margin = "10px 0 10px 0";
        p_div.innerHTML = "<i>&lambda;</i><sub>o</sub>&nbsp;=&nbsp;";
        var p_elem;
        p_elem = document.createElement('input');
        p_elem.type = "text";
        p_elem.size = 3;
        p_elem.id = "lambda_o";
        p_div.appendChild(p_elem);
        input2.appendChild(p_div);
      }

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

    var output = document.getElementById('output');
    output.innerHTML = "<h1>Ответ</h1>";
    //Критерий Байеса
    if(document.getElementById('bayes').checked)
      {
        var p_elem, SP, P = new Array();
        SP = 0;
        for(j=0; j<n; j++)
          {
            p_elem = document.getElementById('p('+(j+1)+')');
            if(p_elem == null)
              {
                alert('Необходимо задать вектор P!');
                return;
              }
            P[j] = parseFloat(p_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
            if(isNaN(P[j]) || P[j] < 0)
              {
                alert('Вектор P должен содержать только действительные неотрицательные числа!');
                return;
              }
            SP += P[j];
          }

        if(SP != 1)
          {
            alert('Состояния природы не составляют полную группу событий (сумма вероятностей не равна 1)!');
            return;
          }

        output.innerHTML += "<p>Критерий Байеса:</p>";
        var Beta = new Array();
        for(i=0; i<m; i++)
          {
            Beta[i] = 0;
            for(j=0; j<n; j++)
              {
                Beta[i] += P[j]*H[i][j];
              }
          }

        var t = 0;
        for(i=0; i<m; i++)
          {
            if(Beta[i] > Beta[t])
              {
                t = i;
              }
          }

        var M, param1, param2;
        for(i=0; i<m; i++)
          {
            M = Math.round(Beta[i]*100)/100;
            if(i == t)
              {
                param1 = "<b>";
                param2 = "</b>";
              }
            else
              {
                param1 = "";
                param2 = "";
              }
            output.innerHTML += "<p><i>A</i><sub>"+(i+1)+"</sub> &mdash; "+param1+"<i>&beta;</i><sub>"+(i+1)+"</sub> = "+M+param2+"</p>";
          }
      }


    //Критерий Вальда
    if(document.getElementById('vald').checked)
      {
        output.innerHTML += "<p>Критерий Вальда:</p>";
        var t, minH = new Array();
        for(i=0; i<m; i++)
          {
            t = 0;
            for(j=0; j<n; j++)
              {
                if(H[i][j] < H[i][t])
                  {
                    t = j;
                  }
              }
            minH[i] = H[i][t];
          }

        t = 0;
        for(i=1; i<m; i++)
          {
            if(minH[t] < minH[i])
              {
                t = i;
              }
          }

        var param1, param2;
        for(i=0; i<m; i++)
          {
            if(i == t)
              {
                param1 = "<b>";
                param2 = "</b>";
              }
            else
              {
                param1 = "";
                param2 = "";
              }
            output.innerHTML += "<p><i>A</i><sub>"+(i+1)+"</sub> &mdash; "+param1+"<i>&zeta;</i><sub>"+(i+1)+"</sub> = "+minH[i]+param2+"</p>";
          }
      }

    //Критерий максимакса
    if(document.getElementById('maxmax').checked)
      {
        output.innerHTML += "<p>Критерий максимакса:</p>";
        var t, maxH = new Array();
        for(i=0; i<m; i++)
          {
            t = 0;
            for(j=0; j<n; j++)
              {
                if(H[i][j] > H[i][t])
                  {
                    t = j;
                  }
              }
            maxH[i] = H[i][t];
          }

        t = 0;
        for(i=1; i<m; i++)
          {
            if(maxH[t] < maxH[i])
              {
                t = i;
              }
          }

        var param1, param2;
        for(i=0; i<m; i++)
          {
            if(i == t)
              {
                param1 = "<b>";
                param2 = "</b>";
              }
            else
              {
                param1 = "";
                param2 = "";
              }
            output.innerHTML += "<p><i>A</i><sub>"+(i+1)+"</sub> &mdash; "+param1+"<i>&mu;</i><sub>"+(i+1)+"</sub> = "+maxH[i]+param2+"</p>";
          }
      }

   //Критерий Гурвица
    if(document.getElementById('gurvits').checked)
      {
        var lo_elem = document.getElementById('lambda_o');
        if(lo_elem == null)
          {
            alert('Необходимо задать показатель оптимизма!');
            return;
          }
        var lo = parseFloat(lo_elem.value.replace(/(^\s+)|(\s+$)/g, "").replace(/,/g, "."));
        if(isNaN(lo) || lo < 0 || lo > 1)
          {
            alert('Показатель оптимизма должен быть числом в интервале от 0 до 1!');
            return;
          }

        var lp = 1 - lo;

        output.innerHTML += "<p>Критерий пессимизма-оптимизма Гурвица:</p>";

        var t, minH = new Array();
        for(i=0; i<m; i++)
          {
            t = 0;
            for(j=0; j<n; j++)
              {
                if(H[i][j] < H[i][t])
                  {
                    t = j;
                  }
              }
            minH[i] = H[i][t];
          }

        var maxH = new Array();
        for(i=0; i<m; i++)
          {
            t = 0;
            for(j=0; j<n; j++)
              {
                if(H[i][j] > H[i][t])
                  {
                    t = j;
                  }
              }
            maxH[i] = H[i][t];
          }

        var Beta = new Array();
        for(i=0; i<m; i++)
          {
            Beta[i] = lp*minH[i] + lo*maxH[i];
          }

        t = 0;
        for(i=1; i<m; i++)
          {
            if(Beta[i] > Beta[t])
              {
                t = i;
              }
          }

        var param1, param2;
        for(i=0; i<m; i++)
          {
            M = Math.round(Beta[i]*100)/100;
            if(i == t)
              {
                param1 = "<b>";
                param2 = "</b>";
              }
            else
              {
                param1 = "";
                param2 = "";
              }
            output.innerHTML += "<p><i>A</i><sub>"+(i+1)+"</sub> &mdash; "+param1+"<i>&gamma;</i><sub>"+(i+1)+"</sub> = "+M+param2+"</p>";
          }
      }

    //Критерий Лапласа
    if(document.getElementById('laplas').checked)
      {
        output.innerHTML += "<p>Критерий Лапласа:</p>";
        var Beta = new Array();
        for(i=0; i<m; i++)
          {
            Beta[i] = 0;
            for(j=0; j<n; j++)
              {
                Beta[i] += H[i][j];
              }
          }

        var t = 0;
        for(i=0; i<m; i++)
          {
            if(Beta[i] > Beta[t])
              {
                t = i;
              }
          }

        var M, param1, param2;
        for(i=0; i<m; i++)
          {
            M = Math.round(Beta[i]*100)/100;
            if(i == t)
              {
                param1 = "<b>";
                param2 = "</b>";
              }
            else
              {
                param1 = "";
                param2 = "";
              }
            output.innerHTML += "<p><i>A</i><sub>"+(i+1)+"</sub> &mdash; "+param1+"<i>&nu;</i><sub>"+(i+1)+"</sub> = "+M+param2+"</p>";
          }
      }

    //Критерий Сэвиджа
    if(document.getElementById('sevidzh').checked)
      {
        output.innerHTML += "<p>Критерий Сэвиджа:</p>";
        var maxHS, t;
        maxHS = new Array();
        for(j=0; j<n; j++)
          {
            t = 0;
            for(i=1; i<m; i++)
              {
                if(H[i][j] > H[t][j])
                  {
                    t = i;
                  }
                maxHS[j] = H[t][j];
              }
          }
          
        var R = new Array();
        for(i=0; i<m; i++)
          {
            R[i] = new Array();
            for(j=0; j<n; j++)
              {
                R[i][j] = maxHS[j] - H[i][j];
              }
          }
          
        var h_table = document.createElement('table');
        h_table.cellSpacing = '0';
        h_table.cellPadding = '10';
        //h_table.border = '1';
        var h_tbody = document.createElement('tbody');
        var h_tr, h_td, h_elem, i, j;
        for(i=0; i<m; i++)
          {
            h_tr = document.createElement('tr');
            if(i == 0)
              {
                h_td = document.createElement('td');
                h_td.rowSpan = m;
                h_td.style.verticalAlign = 'middle';
                h_td.innerHTML = "<i>R</i>&nbsp;=&nbsp;";
                h_tr.appendChild(h_td);
              }

            for(j=0; j<n; j++)
              {
                h_td = document.createElement('td');
                if(j == 0)
                  {
                    h_td.style.borderLeft = '2px solid black';
                  }
                else if(j == n-1)
                  {
                    h_td.style.borderRight = '2px solid black';
                  }
                h_td.innerHTML = R[i][j];
                h_tr.appendChild(h_td);
              }
            h_tbody.appendChild(h_tr);
          }

        h_table.appendChild(h_tbody);
        output.appendChild(h_table);
        
        var maxR = new Array();
        for(i=0; i<m; i++)
          {
            t = 0;
            for(j=1; j<n; j++)
              {
                if(R[i][j] > R[i][t])
                  {
                    t = j;
                  }
              }
            maxR[i] = R[i][t];
          }
          
        t = 0;
        for(i=1; i<m; i++)
          {
            if(maxR[i] < maxR[t])
              {
                t = i;
              }
          }
          
        var param1, param2;
        output.innerHTML += "<br />";
        for(i=0; i<m; i++)
          {
            if(i == t)
              {
                param1 = "<b>";
                param2 = "</b>";
              }
            else
              {
                param1 = "";
                param2 = "";
              }
            output.innerHTML += "<p><i>A</i><sub>"+(i+1)+"</sub> &mdash; "+param1+"<i>&sigma;</i><sub>"+(i+1)+"</sub> = "+maxR[i]+param2+"</p>";
          }
      }
  }

