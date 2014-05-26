#include <stdlib.h>
#include <string>
#include <cstring>
#include <math.h>
#include "cpp_functions.h"
using namespace std;

//Конвертировать HEX в DEC
int hex2dec(char* hex)
  {
    ///Переменные
    int len, i, dec, p;
    string hex_digits = "0123456789ABCDEF";
    
    //Алгоритм
    len = strlen(hex);

    for(i=0; i<len; i++)
      {
        switch(hex[i])
          {
            case 'a':
              hex[i] = 'A';
            break;
            case 'b':
              hex[i] = 'B';
            break;
            case 'c':
              hex[i] = 'C';
            break;
            case 'd':
              hex[i] = 'D';
            break;
            case 'e':
              hex[i] = 'E';
            break;
            case 'f':
              hex[i] = 'F';
            break;
          }
      }

    dec = 0;
    for(i=len-1; i>=0; i--)
      {
        p = hex_digits.find(hex[i]);
        dec += p*pow(16, len-i-1);
      }

    return dec;
  }

//Декодировать URI
string decodeURI(string str)
  {
	 int len = str.length();
	 char* buff = new char[len + 1];
	 strcpy(buff,str.c_str());
	 string ret = "";
	 for(int i=0;i<len;i++)
    {
		  if(buff[i] == '+')
        {
			   ret = ret + " ";
		    }
      else if(buff[i] == '%')
        {
			   char tmp[4];
			   char hex[4];
			   hex[0] = buff[++i];
			   hex[1] = buff[++i];
			   hex[2] = '\0';
			   sprintf(tmp,"%c", hex2dec(hex));
			   ret = ret + tmp;
		    }
      else
        {
			   ret = ret + buff[i];
	 	    }
	   }
	 delete[] buff;
	 return ret;
  }

//Получить XML-структуру из POST-запроса
void get_xml_(char *cont, int &cl, char *xml)
  {
    string str_xml = decodeURI((string)cont);
    strncpy(xml, str_xml.c_str(), cl);
    return;
  }

//Получить m и n
void parse_xml_mn_(char *xml, int &m, int &n, bool &need_dual, bool &need_interv, double &eps)
  {
    int p, c;
    string xml_string;
    
    xml_string = (string)xml;

    p = xml_string.find("<m>") + 3;
    c = xml_string.find("</m>") - p;
    m = atoi(xml_string.substr(p, c).c_str());
    
    p = xml_string.find("<n>") + 3;
    c = xml_string.find("</n>") - p;
    n = atoi(xml_string.substr(p, c).c_str());

    p = xml_string.find("<need_dual>") + 11;
    c = xml_string.find("</need_dual>") - p;
    need_dual = (xml_string.substr(p, c) == "1");

    p = xml_string.find("<need_intervals>") + 16;
    c = xml_string.find("</need_intervals>") - p;
    need_interv = (xml_string.substr(p, c) == "1");

    p = xml_string.find("<eps>") + 5;
    c = xml_string.find("</eps>") - p;
    //eps = atof(xml_string.substr(p, c).c_str());
    eps = atof(xml_string.substr(p, c).c_str());

    return;
  }

//Получить матрицу A и векторы b и c
void parse_xml_abc_(char *xml, int &m, int &n, double *A, double *b, double *c, int &info)
  {
    //Переменные
    int i, j, l, p, g;
    char tmp[64], s[32];
    string xml_string;
    
    //Преобразование типов данных
    xml_string = (string)xml;

    //Заполнение вектора b
    for(i=0; i<m; i++)
      {
        sprintf(s, "%i\0", i+1);
        strcpy(tmp, "<b i='");
        strncat(tmp, s, 64-strlen(tmp));
        strncat(tmp, "'>", 64-strlen(tmp));
        p = xml_string.find(tmp) + strlen(tmp);
        if(p == strlen(tmp)-1)
          {
            info = 1;
            return;
          }
        g = xml_string.find("</b>") - p;
        b[i] = atof(xml_string.substr(p, g).c_str());
      }

    //Заполнение вектора c
    for(j=0; j<n; j++)
      {
        sprintf(s, "%i\0", j+1);
        strcpy(tmp, "<c j='");
        strncat(tmp, s, 58);
        strncat(tmp, "'>", 64-strlen(tmp));
        p = xml_string.find(tmp) + strlen(tmp);
        if(p == strlen(tmp)-1)
          {
            info = 1;
            return;
          }
        g = xml_string.find("</c>") - p;
        c[j] = atof(xml_string.substr(p, g).c_str());
      }

    //Заполнение массива A
    l = 0;
    for(i=0; i<m; i++)
      {
        for(j=0; j<n; j++)
          {
            sprintf(s, "%i\0", i+1);
            strcpy(tmp, "<a i='");
            strncat(tmp, s, 58);
            sprintf(s, "%i\0", j+1);
            strncat(tmp, "' j='", 64-strlen(tmp));
            strncat(tmp, s, 64-strlen(tmp));
            strncat(tmp, "'>", 64-strlen(tmp));
            p = xml_string.find(tmp) + strlen(tmp);
            if(p == strlen(tmp)-1)
              {
                info = 1;
                return;
              }
            g = xml_string.find("</a>") - p;
            A[l] = atof(xml_string.substr(p, g).c_str());
            l++;
          }
      }
    info = 0;
    return;
  }
