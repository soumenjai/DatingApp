using System;

namespace API.Extension
{
    public static class DateTimeExtension
    {
         public static int CalculateAge(this DateTime dob)
         {
            var today = DateTime.Now;
            var age = today.Year - dob.Year;

            if(dob.Date > today.AddYears(-age)) age--;
            return age;
         }
    }
}