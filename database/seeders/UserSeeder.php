<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
//        User::factory()->create([
//            'name' => 'Seulgi Kang',
//            'email' => 'student1@up.edu.ph',
//            'password' => bcrypt('1234'),
//            'role_id' => 3,
//        ]);
//
//        User::factory()->create([
//            'name' => 'Irene Bae',
//            'email' => 'admin@up.edu.ph',
//            'password' => bcrypt('admin1234'),
//            'role_id' => 1,
//        ]);
//
//        User::factory()->create([
//            'name' => 'Joy Batumbakal',
//            'email' => 'manager@up.edu.ph',
//            'password' => bcrypt('manager1234'),
//            'role_id' => 2,
//        ]);

//        User::factory()->create([
//            'name' => 'Yeri Kim',
//            'email' => 'student2@up.edu.ph',
//            'password' => bcrypt('qwer'),
//            'role_id' => 3,
//        ]);
//
//        User::factory()->create([
//            'name' => 'Wendy Shon',
//            'email' => 'student3@up.edu.ph',
//            'password' => bcrypt('asdf'),
//            'role_id' => 3,
//        ]);

//        User::factory()->create([
//            'name' => 'Gian Bernardino',
//            'email' => 'student4@up.edu.ph',
//            'password' => bcrypt('zxcv'),
//            'role_id' => 3,
//        ]);
//
//        User::factory()->create([
//            'name' => 'Maki',
//            'email' => 'student5@up.edu.ph',
//            'password' => bcrypt('maki'),
//            'role_id' => 3,
//        ]);

        User::factory()->create([
            'name' => 'Tonet Jadaone',
            'email' => 'student6@up.edu.ph',
            'password' => bcrypt('tonet'),
            'role_id' => 3,
        ]);

        User::factory()->create([
            'name' => 'JP Habac',
            'email' => 'student7@up.edu.ph',
            'password' => bcrypt('jp'),
            'role_id' => 3,
        ]);
    }
}
