//Получить XML-структуру из POST-запроса
extern "C" { void get_xml_(char *cont, int &cl, char *xml); }

//Получить m и n
extern "C" { void parse_xml_mn_(char *xml, int &m, int &n, bool &need_dual, bool &need_interv, double &eps); }

//Получить A, b, c
extern "C" { void parse_xml_abc_(char *xml, int &m, int &n, double *A, double *b, double *c, int &info2); }
