//        onClick="submit_form('contact_form');"

// CONTAACT FORM
const submit_form = (e) => {
    e.preventDefault();
    var contact_email = $('input[name="email"]').val();

    if (/(.+)@(.+){2,}\.(.+){2,}/.test(contact_email)) {
        var data = e.serializeArray().map(x => {
            var a = {};
            a[x.name] = x.value;
            return a;
        }).reduce(function (result, item) {
            var key = Object.keys(item)[0]; //first property: a, b, c
            result[key] = item[key];
            return result;
        }, {});
        const url = "https://contact.spl.yt/contacts";
        // const url = "http://localhost:8080/contacts";

        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-tag": "NWMyYWYyZDA1Yzg0MGJlMTdlN2I2MGU0YzgxYzUwZmEyYWE1ZDM4MzFiNDQxY2E4ZDRlYTg2ZTcxN2Y1Y2U4YS8vLy8vLzYzNzA=",
            },
            body: JSON.stringify(data),
        };
        fetch(url, options)
            .then((response) => {
                $('#message').html(
                    '<div class="alert alert-success text-center"><strong>Thank you for your submission!</strong> A spl.yt team member will be in contact with you as soon as possible!" and redirect to home page.</div>'
                );

                setTimeout(reload, 3000);   
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            })
            .catch((err) => {
                $('#message').html('Failed');
                console.log(xhr);
                alert(JSON.parse(xhr.responseText).error.message);

            })
    } else {
        $('#message').html(
            '<div class="alert alert-danger text-center"><strong>Error!</strong> Please fill all fields from the form below</div>'
        );
    }
}


function reload() {
    location.replace('https://spl.yt/');
}
// $('#message2').on('submit', (e) => {
//     e.preventDefault();

//     let form = $('#message2');
//     let values = {mauticform: form.serializeArray().reduce((obj, val) => { obj[val.name] = val.value; return obj; }, {})};

//     $.ajax({
//       url: form.attr('action') + '?formId=' + form.find('[name=formId]').val(),
//       data: $.param(values),
//       type: 'POST',
//       headers: {'X-Requested-With': 'XMLHttpRequest'},
//       success: (content, status, xhr) => {
//         $('#warning2').html('<span id="warning-text"></span>');
//         $('#message2').html(
//             '<span id="confirm-icon"><i class="fa fa-check" aria-hidden="true"></i></span><input type="text" id="confirm-input" disabled="disabled" class="form-control" value="Thanks for joining the spl.yt community!" />'
//         );      
//     },
//       error: (xhr) => {
//         $('#warning2').html('Failed');
//         alert(JSON.parse(xhr.responseText).error.message);
//           },
//     });
//   });
  

// SUBSCRIBE
function submit_form2() {


    var noti_email = $('input[name="noti_email2"]').val();
    //  event.preventDefault();
    var data = {
            "email": noti_email,
            "subject": "Spl.yt Newsletter Sign Up",
            "delivery_email": "shop@spl.yt",
        };

    if (/(.+)@(.+){2,}\.(.+){2,}/.test(noti_email)) {

        const url = "https://contact.spl.yt/contacts";
        // const url = "http://localhost:8080/contacts";
        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-tag": "NWMyYWYyZDA1Yzg0MGJlMTdlN2I2MGU0YzgxYzUwZmEyYWE1ZDM4MzFiNDQxY2E4ZDRlYTg2ZTcxN2Y1Y2U4YS8vLy8vLzYzNzA=",
            },
            body: JSON.stringify(data),
        };
        fetch(url, options)
            .then((response) => {
                $('#warning2').html('<span id="warning-text"></span>');
                $('#message2').html(
                    '<span id="confirm-icon"><i class="fa fa-check" aria-hidden="true"></i></span><input type="text" id="confirm-input" disabled="disabled" class="form-control" value="Thanks for joining the spl.yt community!" />'
                );
            })
            .catch((err) => {
                $('#message2').html('Failed');
                alert(JSON.parse(xhr.responseText).error.message);
            })
    } else {
        $('#warning2').html('<span id="warning-text">Please provide a valid email</span>');
    }

}