/*переменные*/
var Ajax_Root = '/diplom/system/jscripts/'; //каталог, где лежат скрипты

/*проверка Ajax*/
function verifyAjax()
  {
    if(!createAjax)
      alert('Ошибка создания экземпляра объекта XMLHttpRequest!');
  }

/*создание экземпляра объекта XMLHttpRequest*/
function createAjax()
  {
    var ajax_request = false;
    try
      {
        ajax_request = new XMLHttpRequest();
      }
    catch(trymicrosoft)
      {
        try
          {
            ajax_request = new ActiveXObject("Msxml2.XMLHTTP");
          }
        catch(othermicrosoft)
          {
            try
              {
                ajax_request = new ActiveXObject("Microsoft.XMLHTTP");
              }
            catch(failed)
              {
                ajax_request = false;
              }
          }
      }
    return ajax_request;
  }
  
/*фоновый get-запрос*/
function AjaxGET(act, get, code)
  {
    var ajax_request = createAjax();
    if(!ajax_request)
      return;
      
    if(get != '')
      url = act + '?' + get;
    else
      url = act;
      
    ajax_request.open("GET", url, true);
    ajax_request.onreadystatechange = function()
      {
        if(ajax_request.readyState == 4 && ajax_request.status == 200)
          {            
            eval(code);
          }
      }
    ajax_request.send(null);
  }

/*фоновый post-запрос*/
function AjaxPOST(act, post, code)
  {
    var ajax_request = createAjax();
    if(!ajax_request)
      return;
    
    ajax_request.open("POST", act, true);
    ajax_request.onreadystatechange = function()
      {
        if(ajax_request.readyState == 4 && ajax_request.status == 200)
          {
            eval(code);
          }
      }
    ajax_request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    ajax_request.setRequestHeader("Content-Length", post.length);
    ajax_request.setRequestHeader("Connection", "close");
    ajax_request.send(post);
  }

/*include в JS*/
function include(jscript)
  {
    /*создание экземпляра объекта XMLHttpRequest*/
    var request = createAjax();
    if(!request)
      return false;

    /*запрос на сервер*/
    var get = escape(jscript);
    request.open("GET", Ajax_Root+"file_get_contents.php?file="+get, false);
    request.send(null);

    /*выполнение*/
    if(request.status == 200 && request.responseText != '')
          {
            eval(request.responseText);
            return true;
          }
    else
          {
            return false;
          }
  }

/*file_get_contents через JS*/
function file_get_contents(fname)
  {
    /*создание экземпляра объекта XMLHttpRequest*/
    var request = createAjax();
    if(!request)
      return false;

    /*запрос на сервер*/
    var get = escape(fname);
    request.open("GET", Ajax_Root+"file_get_contents.php?file="+get, false);
    request.send(null);

    /*возврат результата*/
    if(request.status == 200)
          {
            return request.responseText;
          }
    else
          {
            return false;
          }
  }
