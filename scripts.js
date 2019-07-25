var sqldb=openDatabase('Calendar',1.0,'Calendar Notes',20*1024*1024)
sqldb.transaction(function(tx){
    tx.executeSql('CREATE TABLE IF NOT EXISTS Takvim (id INTEGER PRIMARY KEY, Days INTEGER, Months INTEGER, Years INTEGER, Notes varchar2(255))',[],function(){
        console.log("Takvim Tablosu oluşturuldu");
        tx.executeSql('DELETE FROM Takvim WHERE Notes=""')
    });
})

Takvim={
    db:openDatabase('Calendar',1.0,'Takvim Notları',20*1024*1024),
    insert:function(tablename,colunm,getdata,value){
        this.db.transaction(function (tx){
            tx.executeSql('INSERT INTO '+tablename+' ('+colunm+') VALUES ('+getdata+')', value);
            })
    }

}

today = new Date(); // tarihle ilgili işlemler için nesne oluşturduk
currentDay=today.getDate();
currentMonth = today.getMonth();
currentYear = today.getFullYear();
selectYear = document.getElementById("year");
selectMonth = document.getElementById("month");

months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

monthAndYear = document.getElementById("monthAndYear");
showCalendar(currentMonth, currentYear);

function next() {
    currentYear = (currentMonth == 11) ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(currentMonth, currentYear);
}

function previous() {
    currentYear = (currentMonth == 0) ? currentYear - 1 : currentYear;
    currentMonth = (currentMonth == 0) ? 11 : currentMonth - 1;
    showCalendar(currentMonth, currentYear);
    
}

function jump() {
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    showCalendar(currentMonth, currentYear);
}

function goingToday(){
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    showCalendar(currentMonth, currentYear);
}

function showCalendar(month, year) {

    let firstDay = (new Date(year, month)).getDay()-1;
    if(firstDay==-1){
        firstDay=6;
    }

    // Takvimin Gövdesini htmle ekliyoruz
    tbl = document.getElementById("calendar-body"); 

    // table in içindeki önceki hücreleri temizlemek için
    tbl.innerHTML = "";

    // h3 etiketinde ay ve yıl a ait bilgileri ekliyoruz
    monthAndYear.innerHTML = months[month] + " " + year;

    //combobox larda ay ve yılın da paralel görüntülenmesini sağlıyoruz
    selectYear.value = year;
    selectMonth.value = month;

    // tablein tüm hücrelerini oluşturmak için
    let date = 1;
    let say=1;
    var metindays=""
    //tabloda ilk boş hücrelere önceki ayın günlerini yazdırmak için gün sayılarını arraya aktardık
    var daysMonth = ["31","28","31","30","31","30","31","31","30","31","30","31"]
    sqldb.transaction(function(tx){
        tx.executeSql('SELECT Days, Months, Years FROM Takvim',[],function(tx,results){
            for(var i=0; i<results.rows.length; i++){
                document.getElementById("sqlGunler").value+=" "+results.rows.item(i).Days;
                document.getElementById("sqlAylar").value+=" "+results.rows.item(i).Months;
                document.getElementById("sqlYillar").value+=" "+results.rows.item(i).Years;
            }
        }, null);
    });
    
    for (let i = 0; i < 6; i++) {
        // Tabloda satır oluşturmak için
        let row = document.createElement("tr");

        //mevcut ayın bir eksik indisini bir değişkene atadık. başlangıç günlleri bir önceki ay olacağı için
        var z=currentMonth-1;

        //ay 0 olursa -1 dondureceği için aralık ayının indisi olmasını sağladık
        if(currentMonth==0){
            z=11;
        }

        //z den gelen aya ait gün sayısını arraydan alıp x e aktardık
        var x=daysMonth[z];
        //toplam günden çıkartılacak gün sayısı için haftanın indisinin 1 eksiğini y ye atadık
        var y =firstDay-1;

        //mart ayını goruntulerken ilk kutuların şubat ayının son günlerini yazması için
        //4 yılda 1 şubat 29 cekıyor. mart ayı da indis olarak 2 ye denk geldiği için o şartlarda x 29 olsun.
        if(currentYear%4==0 && currentMonth==2){
            x=29;
        }
        //oluşturulan hücrelere verileri eklemek için
        for (let j = 0; j < 7; j++) {
            //select ile gün ay yıl bilgisini tablodan çek. o tarihlere ait hücrelerin rengini yeşil yap
            var sqlGun=document.getElementById("sqlGunler").value;
            var sqlYil=document.getElementById("sqlYillar").value;
            var sqlay=document.getElementById("sqlAylar").value;
            var gunArray=sqlGun.split(" ");
            var yilArray=sqlYil.split(" ")
            var ayArray=sqlay.split(" ");
            console.log(gunArray.length )
            for(var z=0; z<gunArray.length; z++){
                if (date == parseInt(gunArray[z])+1  && year == yilArray[z] && months[month]==ayArray[z]) {
                    cell.classList.add("bg-danger");
                }
            }
   
            //Ayın ilk gününden önceki boş hücrelere önceki ayın son günlerini yazdırır
            if (i == 0 && j < firstDay) {
                cell = document.createElement("td");
                cellText = document.createTextNode(x-y);
                y--;
                cell.appendChild(cellText);
                row.appendChild(cell);
                cell.classList.add("mystyle1");
            }
            //Ayın son gününden sonraki boş hücrelere sonraki ayın ilk günlerini yazdırır
            else if (date > daysInMonth(month, year)) {
                cell = document.createElement("td");
                cellText = document.createTextNode(say);
                say++;
                cell.appendChild(cellText);
                row.appendChild(cell);
                cell.classList.add("mystyle2");
            }

            else {
                cell = document.createElement("td");
                cellText = document.createTextNode(date);
                //Table da geçerli günü vurgulayarak rengini bg-info yapıyoruz. mavimsi
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("bg-info");
                }
                cell.appendChild(cellText);
                row.appendChild(cell);
                date++;
            }
        }
        //her satırı takvim gövdesine eklenmesi
        tbl.appendChild(row);
    }
    var table = document.getElementById("calendar");
    //table da tıklama işlemini tetikler. 1. satır 0. hücreden başlar. son hücreye kadar kontrol eder.
    for (var i = 1; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++)
        table.rows[i].cells[j].onclick = function () {
            tableNote(this);
        };
    }
    
    //bir hücre tıklandıgında not ekleme ekranı acılır. promt a yazdıgımız bilgi textareaya ekler.
    function tableNote(tableCell) {
        gun=tableCell.innerHTML;
        ay=months[currentMonth];
        yıl=currentYear;
        metin=prompt("Tarihe Not Eklemek İstermisinis ?");
        //console.log(gun+" "+ay+" "+yıl)
        //console.log(metin);
        //textareanın üstünde tıklanan tarihe ait bilgilerin yer alması sağlanır.
        document.getElementById("myNotes").innerHTML =gun+" "+ay+" "+yıl
        document.myForm.myTextArea.value=metin;
        metin2=document.myForm.myTextArea.value;
        //seçilen gün ay yıl bilgisine websqlde varsa notes sütünunaki bilginin textarea ya yazılmaısnı sagladık
        sqldb.transaction(function(tx){
            tx.executeSql('SELECT Notes FROM Takvim WHERE Days='+gun+' AND Months="'+ay+'" AND Years='+yıl+'',[],function(tx,results){
                document.getElementById("textAreamet").value=results.rows.item(0).Notes;
            }, null);
        });
    }
}

function myNotes(h){
    sqldb.transaction(function(tx){
        tx.executeSql('SELECT Notes FROM Takvim WHERE Days='+gun+' AND Months="'+ay+'" AND Years='+yıl+'',[],function(tx,results){
            document.getElementById("textAreamet").value=results.rows.item(0).Notes;
        }, null);
    });
}

//save butonu click oldugunda textareada yazan metni(en az 5 karekter) gün ay yıl bilgisine göre tabloya ekler. 
function saveNotes(h){
    metin2=document.getElementById("textAreamet").value;
    array=[gun,ay,yıl,metin2];
    value=["Days,Months,Years,Notes"];
    getdata="?,?,?,?";
    if(metin2.length<5){
        alert("En Az Beş Karakter giriniz")
        document.getElementById("textAreamet").value=metin2;
    }
    //ekledikten sonra textareanın içini temizler.
    else{
        Takvim.insert('Takvim',value,getdata,array);
        document.getElementById("textAreamet").value="";
    }
}
//update butonu tıklandıgında gorutulenen notu duzenleyerek Takvim tablosuna kaydeder
function updateNotes(h){
    metin3=document.getElementById("textAreamet").value;
    sqldb.transaction(function(tx){
        tx.executeSql('UPDATE Takvim SET NOTES="'+metin3+'"WHERE Days='+gun+' AND Months="'+ay+'" AND Years='+yıl+'');
        document.getElementById("textAreamet").value="";
    })
}

//sectiğimiz notu Tablodon silme işlemi yapar.
function deleteNotes(h) {
    sqldb.transaction(function(tx){
        tx.executeSql('DELETE FROM Takvim WHERE Days='+gun+' AND Months="'+ay+'" AND Years='+yıl+'')
        document.getElementById("textAreamet").value="";
    })
}

// belirtilen ay da kaç gün olması gerektiğini belirttik https://dzone.com/articles/determining-number-days-month
function daysInMonth(iMonth, iYear) {
    var a=32 - new Date(iYear, iMonth, 32).getDate();
    return a;
}








