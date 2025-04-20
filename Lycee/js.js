formData.append('token', 'YOUR_CSRF_OR_AUTH_TOKEN');

$(document).ready(function () {
  document.getElementById('saveNewStudent').addEventListener('click', function() {
      const formData = new FormData();
      
      // Add file if selected
      const photoInput = document.getElementById('studentPhoto');
      if (photoInput.files.length > 0) {
          formData.append('photo', photoInput.files[0]);
      }

      // Add all other form fields
      const formFields = {
          'name': $('#studentName').val(),
          'massarCode': $('#massarCode').val(),
          'birthDate': $('#studentBirthDate').val(),
          'birthPlace': $('#studentBirthPlace').val(),
          'fatherName': $('#fatherName').val(),
          'fatherProfession': $('#fatherProfession').val(),
          'motherName': $('#motherName').val(),
          'motherProfession': $('#motherProfession').val(),
          'motherPhone': $('#motherPhone').val(),
          'fatherPhone': $('#fatherPhone').val(),
          'idCardNumber': $('#identityCardNumber').val(),
          'idCardExpiry': $('#identityCardExpiry').val(),
          'schoolOrigin': $('#schoolOrigin').val(),
          'schoolAddress': $('#schoolAddress').val(),
          'emergencyContact': $('#emergencyContact').val(),
          'personalPhone': $('#personalPhone').val(),
          'lyceeCardNumber': $('#lyceeCardNumber').val(),
          'lyceeCardExpiry': $('#lyceeCardExpiry').val(),
          'passportNumber': $('#passportNumber').val(),
          'passportDate': $('#passportDate').val(),
          'driverLicenseNumber': $('#driverLicenseNumber').val(),
          'driverLicenseDate': $('#driverLicenseDate').val(),
          'brothersNumber': $('#brothersNumber').val(),
          'sistersNumber': $('#sistersNumber').val(),
          'prchesNumber': $('#prchesNumber').val(),
          'entryDate': $('#entryDate').val(),
          'examDate': $('#examDate').val(),
          'examMethod': $('#examMethod').val(),
          'option': $('#option').val(),
          'classe': $('#classe').val()
      };

      // Append all form fields to FormData
      Object.keys(formFields).forEach(key => {
          formData.append(key, formFields[key]);
      });

      // Send AJAX request
      $.ajax({
          url: 'php/save_student.php',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          dataType: 'json',
          success: function(response) {
              if (response.success) {
                  Swal.fire({
                      icon: 'success',
                      title: 'Succès',
                      text: 'Étudiant ajouté avec succès',
                      timer: 2000,
                      showConfirmButton: false
                  });
                  $('#studentModal').modal('hide');
                  // Optionally refresh the student list or add the new student to the table
              } else {
                  Swal.fire({
                      icon: 'error',
                      title: 'Erreur',
                      text: response.error || 'Une erreur est survenue lors de l\'enregistrement'
                  });
              }
          },
          error: function(xhr, status, error) {
              console.error('Error details:', xhr.responseText);
              Swal.fire({
                  icon: 'error',
                  title: 'Erreur',
                  text: 'Une erreur est survenue lors de la communication avec le serveur'
              });
          }
      });
  });
});