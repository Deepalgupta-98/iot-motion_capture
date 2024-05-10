Inside the <script> </script> tags we will include the JavaScript. It includes the getData() function as defined below. This function takes in no parameters. It is responsible to acquire the PIR motion detection data from ESP32 board. This will be used to update the web server by adding the table contents. The current date and time of motion detection will get added in the first cell and the activity in the second cell. Inside this function we use the XMLHttpRequest. This will allow us to make an HTTP request in JavaScript. This will make sure that the web server updates automatically with out the need to reload it.

function getData() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
  var date = new Date();
  var txt = this.responseText;
  var obj = JSON.parse(txt); 
      Avalues.push(obj.Activity);
      dateStamp.push(date);

    var table = document.getElementById("data_table");
    var row = table.insertRow(1); 
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = date;
    cell2.innerHTML = obj.Activity;
    }
  };

xhttp.open("GET", "read_data", true); 
  xhttp.send();
We will initialize the request by using the xhttp.open() method. Inside it we will pass on three arguments. The first argument specifies the type of HTTP method which is GET in our case. The second argument is the URL. In our case, it is the read_data URL. The last argument is true which specifies that the request is asynchronous.
xhttp.open("GET", "read_data", true); 
Lastly, we will use xhr.send() to open the connection. This will send the request to the server.
 xhttp.send();
handleRoot()
The handleRoot() function takes in no parameters. It is responsible for ESP32 handling the /root URL. We will configure the root / URL where our server will listen to HTTP GET requests.
The handling function will respond to the client by using the send() method on the server. This method will take in three parameters. The first is 200 which is the HTTP status code for ‘ok’. The second is “text/html” which will correspond to the content type of the response. The third input is the text saved on the ‘s’ variable which will be sent as the response. It is the MAIN_page.
void handleRoot() {
 String s = MAIN_page; 
 server.send(200, "text/html", s); 
}


read_data()
The read_data() function also takes in no parameters. It acquires the sensor data from the PIR sensor and saves it in the integer variable ‘state.’ This is achieved by using the digitalRead() function and specifying the sensor_pin as the parameter.
Then we will use an if statement to check whether the state of the PIR sensor is HIGH. If it is, them the LED will be turned ON. This will be achieved through the digitalWrite() function and passing the led_pin and “HIGH” as parameters inside it. The LED will turn OFF after a second. Moreover, we will store the string variable ‘message’ that we initially defined with “Motion Detected” text. This will be saved in the string variable ‘data’ and sent to the web server as a response to an HTTP request. All of this will occur if the PIR sensor is in a HIGH state i.e. when it detects motion.
void read_data() {
  int state = digitalRead(sensor_pin); 
  delay(500);                        
  Serial.print(state);
    if(state == HIGH){ 
    digitalWrite (led_pin, HIGH);    
    delay(1000);
    digitalWrite (led_pin, LOW);
    Message = "Motion Detected";
    String data = "{\"Activity\":\""+ String(Message) +"\"}";
    server.send(200, "text/plane", data); 
    send_event("Motion_Detection");               
    Serial.println("Motion detected!");
    }

setup()
Inside, the setup() function we will open a serial communication at a baud rate of 115200.
 Serial.begin(115200);
The following section of code will connect our ESP32 board with the local network whose network credentials we already specified above. After the connection will be established, the IP address will get printed on the serial monitor. This will help us access the web server.
WiFi.begin(ssid, password);
 while (WiFi.status() != WL_CONNECTED) {
 delay(500);
 Serial.print("Connecting...");
 }
 Serial.println("");
 Serial.println("Successfully connected to WiFi.");
 Serial.println("IP address is : ");
 Serial.println(WiFi.localIP());
To start the server, we will call begin() on our server object.
 server.on("/", handleRoot);     
 server.on("/read_data", read_data);
 server.begin();               

Moreover, we will configure the PIR sensor pin as an input and the led pin as an output using the pinMode() function. Using digitalWrite(), we will set the led pin in a LOW state initially so that the LED is OFF at the start of the project.
 pinMode(sensor_pin, INPUT); 
 pinMode(led_pin, OUTPUT); 
 digitalWrite (led_pin, LOW);

loop()
Inside the loop() function we will call handleClient() on the server object so that the server can listen to the HTTP requests continuously.
void loop(){
  server.handleClient();         
}

send_event()
The send_event() function is responsible for connecting with the IFTTT server. It takes in a single parameter which is the event pointer. In our case, we had set our IFTTT event name as ‘Motion_Detection.’ We will pass this as a parameter inside the send_event() function. This function will be called inside the read_data() function.
void send_event(const char *event)
{
  Serial.print("Connecting to "); 
  Serial.println(host); 

  WiFiClient client;
  const int httpPort = 80;
  if (!client.connect(host, httpPort)) {
    Serial.println("Connection failed");
    return;
  } 

  String url = "/trigger/";
  url += event;
  url += "/with/key/";
  url += privateKey; 
  Serial.print("Requesting URL: ");
  Serial.println(url);  
  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
  while(client.connected())
  {
    if(client.available())
    {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    } else {
      delay(50);
    };
  }  
  Serial.println();
  Serial.println("Closing Connection");
  client.stop();
}
