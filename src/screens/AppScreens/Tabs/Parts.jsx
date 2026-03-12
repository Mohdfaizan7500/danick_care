import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import Header from '../../../components/Header'
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Category data with images
const categoryData = [
  {
    id: 1,
    name: 'Air Conditioner',
    icon: '❄️',
    imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRqnl46q4Q9I8ngQnP3_bISKktugrIIsncQLqxv9gSKBNI7bYEeoyHk_2AA-dbLgBVLk70uie-hK8UarJXj6d_pNRwpPzBps4tgH1sXFpiKOUO7KuN9BD4K2g',
    productCount: 10,
    color: 'bg-blue-50',
    spareParts: [
      { id: 101, name: 'Air Filter', image: 'https://i.ebayimg.com/images/g/KS0AAOSws6NmQQYQ/s-l400.jpg', price: '₹450' },
      { id: 102, name: 'Compressor', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9GKAm7XS9COvNqKwKD_Z9ZcUgfFsATT07Zg&s', price: '₹8,500' },
      { id: 103, name: 'Condenser Coil', image: 'https://m.media-amazon.com/images/I/81wh+KS8T1L.jpg', price: '₹3,200' },
      { id: 104, name: 'Fan Motor', image: 'https://tiimg.tistatic.com/fp/1/007/818/low-power-consumption-heavy-duty-high-speed-air-conditioner-fan-motor-489.jpg', price: '₹1,800' },
      { id: 105, name: 'Remote Control', image: 'https://m.media-amazon.com/images/I/515Zva4UlaL.jpg', price: '₹350' },
      { id: 106, name: 'Thermostat', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTlgT-0Spwff8vSFBLK6IbC5atpSRGub15JQ&s', price: '₹650' },
      { id: 107, name: 'Capacitor', image: 'https://5.imimg.com/data5/SELLER/Default/2023/6/320042394/ZX/NX/QQ/120447139/air-conditioner-capacitor-500x500.jpg', price: '₹280' },
      { id: 108, name: 'Evaporator Coil', image: 'https://tiimg.tistatic.com/fp/1/005/106/split-ac-evaporator-coil-066.jpg', price: '₹2,900' },
      { id: 109, name: 'Drain Pipe', image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/UM/KP/HP/117201603/ac-water-drain-pipe.jpg', price: '₹120' },
      { id: 110, name: 'Refrigerant Gas', image: 'https://5.imimg.com/data5/SELLER/Default/2023/5/305884118/JK/SN/RT/102213013/r-22-gas-air-conditioner.jpeg', price: '₹1,200' }
    ]
  },
  {
    id: 2,
    name: 'Refrigerator',
    icon: '🧊',
    imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRV5CbBHtYH6X3x0mQ7TC4osdjl75ZvPe_P1hQ_LIVqT6hfvkMtdsDRDMfPFi7m7JdtihKSLdRlnKwUDA5rzVV6QWLG8XucY8pZA9BXDZcXEBujC6BiCaYJhJSNvhI7FRd2p7b3SWm_&usqp=CAc',
    productCount: 10,
    color: 'bg-cyan-50',
    spareParts: [
      { id: 201, name: 'Compressor', image: 'https://rukminim2.flixcart.com/image/480/480/l4n2oi80/refrigerator-compressor/n/y/r/500-4587-zubi-original-imagfhzzwyvwm7dg.jpeg?q=90', price: '₹7,500' },
      { id: 202, name: 'Thermostat', image: 'https://m.media-amazon.com/images/I/61V5ehjc10L._AC_UF1000,1000_QL80_.jpg', price: '₹380' },
      { id: 203, name: 'Door Gasket', image: 'https://m.media-amazon.com/images/I/61k6+rBhXUL.jpg', price: '₹550' },
      { id: 204, name: 'Evaporator Fan', image: 'https://image.made-in-china.com/318f0j00yQPYWsaGOirN/20240720-140-mp4.webp', price: '₹890' },
      { id: 205, name: 'Condenser Fan', image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExIWFRUWFxYXFxcYFxcXFhcYFxoWFxYYFxUYHSggGBolGxgVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0NFRAPFS0dFR0tKy0tLSsrKy0tLS0rKy0tLS0rLS0tKystKy0rKy0tLS0rLS0rLTctKystKy0tNzctK//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xABCEAABAwEGAwUGBAMGBgMAAAABAAIRAwQFEiExQQZRYSJxgZGhEzJSscHRB0Lh8BRygiNikqKy0jNEU6PC8RUkNP/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAbEQEBAQEAAwEAAAAAAAAAAAAAARECEiExUf/aAAwDAQACEQMRAD8A7iiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIo63W7BqYCDefUA1ICwOvCkJJeMhJ6AbnoqpbL9JMMb4n7LQqWh4D3EuxObDYgNcDALSSMm7+C1OWL3i72W9qFQYqdRrhOGRmJ1jvW0yq06ELkViqmlSe1xMjDgDDJMECDkIy3zPcrXZL6qAAvaCOmoVvKTv9XVFGXfeAeBhMypILDo+oiICIiAiIgIiICIiAiIgIiICIiAiIgItW02+nTc1rnQXaLDb73pUgSXAn4W5n9EEgsNe1MYJc4DvKqdr4jqOGoptOgbm8/bvUUbf8LQD8R7TvXIILtRvFtXFgmGmJIictp2UDxC4kicmzn9PVanDd54ajmvce3EEncTkrHa7M14ViVTqhAUDfT64aW0qrg3ORGfMYSIiPqrdabiGe/IyQfsf3mvXC92n259owENbInMT3LflHLwrn/DNZ1LH7YPeSIbOYHOcUj0KlxfLQAM8uatvGt0SWOpMAJkOjLuMc1H3RwwwQ57cb+bzIHcwZecp5Hh7bHCbnE4xOF23LXNXG0WsU6Ze6YETGZzIGi1bvsQaozi+8Q1gpNPaJBMbAfqsV1ies9tpvEte0+Ofkthc0FqP5gHddHeY+q37FxA+nk12IbNf9Coq+Iom679p1Rn2Hcjp4Fbr7dTDxTxDERIHRBsoiICIiAiIgIiICIiAiIgL4SvqqvF17uafZMcGiO0Zzz2y0QRfE1uZVqyAS1mQOme5CgG2ouPZ0B1P7zKw3paDDWNdOM65wBqcjvsstFgAhBma7nn1OqyB37/AFWGV9qOAbOeUz4Ir2WEmBr35DrKnLJe7qbQ0uNXqBEDln73fkqjd1qxkkmApUXmBk0DvOfpoiLOy+Kbt/MQtihbWAyCJ71QLxvLslz3Q0CTJyA7tFX2X8XtqupOMMYImNcWsdyaOyVbe12pnxWJ98UmauHhn8lx2y35UFB1ao8kNqNBwgAkEHIKaui3MqMFSm84TvmDO4I5qi82zickEU2lvJ52/pVdLi4lznYnHU7lff47LtAOHOId6aqJt9fAcTDI/eRCipz2Y3IHdmfsvDyNAPE5nw2Cw2Oq14DiYBE5CTPKFkMdURqVKjmZntN9R91LXbbGU6jHnEQIzme+AtF56BYbFUc17mYiJ0MxluCe9B1ihWa9oc0yCJBWRU/hu8qjX+zc9tRhMa5g8xMEhXBAREQEREBERAREQEREGC21sFN7uTSc/Rc0tWZLjLnEySd/DVXvign2ETALgD3a/RU20syyEBRUJbaRxsyw65ctOaytYefyW3VpyAS6XA6GZjvWOp0/VUYg081sOYHggCJEemZXljJW1ZyR2YJEzG/eCgq1Gg5nZO37lZ2OVotV1tqNxCATv+V3j+U9CoK03e+mSHNIQYv/AIwWik5jtHAjWPXZVa0cL2igKzaYDg9jWtzh0gyZ257q7XTbGsydlyO36Lze9YOzBHeiKVdXDtrfR9i5gzqtcZMjCBB03VzurhUWWzloMkkuOc5nn5AQvVyuAOamr0vZmDCCCeQ+p2QVkuWF7Jy2ORWyyi5xgAknYBWC7OHXDOoMxngHvf1HRg6lFaF3WbBTZiEgaxlPPPxAXt+uWQ5a+q37XaBm1sQYBMctA2dAOe60cKIxELGxnbG/70WwQstkpCS8ODYGU5eQQG+zLvdcwdDJHWDEq/3JWLqLS5wcRliG8aE8iqVY2uJxO7YOs5z46gq08NtDcYaThMEA6g7j5IJtERAREQEREBERAREQQ/FI/sR/O36qsWzNoDSB37xrnzVn4r//ADn+ZvzVQbLgBHRQYjVp5AMOLCQe1+acjHcvjaBLsIguAkgEEx4KWsnDtMtL39p50AyaPuVqWm7iw5a9NVVa8NGmffl6L7i/9DRejVaTD2mfiGvi3Qr42n2o96NgYPTI5oFAkZtOEbnbuI37lkfbhmIJZtof8pkDwWGo86HKNtI8FiPzRHq12WkWl4AgATEtIOkQZk9yixYmuMN1Oy3q3IaD57lYMCKw1LvDIxSMQkd3OFvXbZKLjmYA1LieU6ALBVzPl8kbkiJYXgymIpt6ZdieeY7R814tNve8YZhnwtEDxG571HLI1yD2khZBZ3HOMI5uMDwBzPgsj2U2c6jv8LAe7VyDA6i6AY7LjDTpiME5TroswqUw0NLHYpOIztsAO9bFOy1K7hj8BoI6D7KTtnDrBheZz7Mz7rj7h6gmB4hBhuJjgSHiGuaSAdSBqY5ZqYuCPaVANIH1UG2k6k4lwIIBHmpXhJ0mqf5fqgsaIiAiIgIiICIiAiIggOMqkUWjm8egKqNGpEKw8eV4FJvMuPlAVYsrsUDzOw5k+CCy3VecZFTTKdN4ndc/sFubUGJhykx3AkKWoXuWwOWh/TdRW7e9iaHwwTAk/RV2tRcM8/HVTNC3Yi9xOZd6AZD1KyOeDrCCJFdwpw6SdGztz110XyzAOyIz2IyjnI+yl61KmRG+vlK+WSztxbZDzzCCCd70D3ZydvHPCvttpYIg45nTYbEzzWUgBZr0aGuAHwj6hUR1BpcYIw9T8sl7tNLC7CO31GQ6wCFtWOmC5o2kLdtNECo6CMiR6ojRdSphuQLnE5GcoAE5c81sXYX54WgOh0GB9Rr1UlRs7fZA5e8Z8mrdseBr258/kUEZRuepUMuk9+al7NcrWPaHZh2U9R+/RSVO3UxlIWhe96twdnUEEeB+0oJhlBrYgDLdR9721uBzeYIUTab7c4wFG2y05FztAJQLXanP1OylOCqnaqDo0+U/dVC+LXhp06jDIdge08+Y8DI8FZ+E6o/iOz7r6cjxh338kFzREQEREBERAREQEREHP/xAqzXY3kz5krXu4hlFpz7T8/AEfIlOMml1sLQJyYPRZb7pPpUxDMQxsAjKGxnPUfVWM9/FZsADH1mN90OJHcc8vVYzeZD4KmLdLKbfdjE8N1xRBOeX7yVUuim51rl7exTDqh5Q3MDxMDxSrLsWxlSC5p1Bg98BbTKphUe5L4x2ioCfecT6q4035KNMtSscQ7ivgtJzz2+y0r2rFjWv2keRJB+S8srgieig9OxLLbXlzp5ZfNYvaLLXMOj96kfRUeLOXNc08iCs9eq4uJ6lYMeYH75r7Uf2j376oN2naXYAJ3P0XqnXOIGdAVG+3gea+3Tasb3chI/yklBLe3dzWta7RlmUe5VPiu9cGFoOpRE9WtxbULNwYKyXq4uY1mntHNZPRxAPoVEW6XvoVmjKowT/ADMhp9MJVnsdQQBhBcWnATAzBEwTkCql9NS+LIx1mqU2NEUxS9mR+XY/PPmtjgmqW1KDHajE2eYMkCF6u3E72rAIIexoxECQM3E7bQvl3sLLUzKIqDIZiJjVROa6QiIjQiIgIiICIiAiIgp164f410wCA2CdMxBB+6xX7eDqbMD2jODiGQgEGM523EqF4vvYUrydTfk11Om4O2GxB8tVI0bU7DAMtOxhzfIpLiWahr3rtrUSGQHT2cjlIgkumPABR7qGChVgjG8BvXCMyfOPJTtpYHflaO6fktV1HoFbdJMc7uq5Xsr+0J8FeqVo6LN/BDkFiNmI3Hko08cSVP8A6pdpGD1qKJua2Ay2fyOPkFYL3Yz+EcHiRgYSOvtVUbmo021Xlm9N+U9AgmbFa8eHqQt+839sdQf9TlV7he1r2jEXS5sCeoU9fGIuaQdjrn+ZyDJZqkvHc7/S5LxrBrnLUu0O9qJIPZftH5StbiOq0uLZLTlMHoOaD3brZFKmZzcHE+a3eCauIPIz7Th/2z91X7ypMNOg0uOTTGeoyVl4NZTYw4B+d5OepwD6IJCrUOeSoXFNzVKtUODtNtleXvJ2C8mgDq0HzREfw/TcbN7N8B1Nwc3PUHJwHofBStzVW08XtticBg6EzAIyaR1Gax0WQYEKTo1y2B7NrhOeImI7tykqWax0cNerLA5+I/lOFoA5mCT4BStGyMo1miZqVKgJEyGAnQL4y8HgQ3CwcmNDfkq/UvpgttmohwLn1mhxn3RMwepyEdVbdJMdUREUUREQEREBERAREQcU/GKnFvafis49HOVEsHElps3ZpvlvwuGJvhy8F1X8aLFJo1QPda9pPQlsfVcTtQzVF2ofiG4nt2cf0vPyIWYfiFRj/g1J72/OVz+jqsaYOhP/ABBpyQKLy3YyAfEbLw7j+n/0X+bVQJSUwdhtVdtosIeJaH02Oz1jHpl1hVW7LE2nUc7GILHN55mFYbgpl1gpDKDSDYPQz8wq1b6EVXsaB2GscTEyXEggpIW4+3LdeGtTJeDD2HX+8FL8VX22g6kHNLsTXnKNnfqtXhqz434hANOrhI0PZwn6+ijfxLEVKA/uP9XBQ3Unw7fza9fA1jm9h7pMbADbvTiO7WvqudjgkN3PwhV/8PDNsI50nj1YforZxdTDKb60CQGAa55tb56oIS9LFjFIB47DMJz3Vn4TaKNAmZANQmMz7gVHs9QmrTYWQKjsMkEAclfLPY3UrO9uQgVDlnq39EIhmceWf/p1PJv+5e2ce2f4Kg8Gn/yXNWlewUHSRx5ZtcFT/C3/AHL7U/EGk0dmi9x6lrR6SubSs9Q6dyCyXhxvaqphpFJp2Zr/AIjn5QtXh+of4yzSf+YpnxL2KDp6hXfgG4HWiux7WyadSm/WAA17ST++So/Q6IigIiICIiAiIgIiIIPiy7fbUpjEWzIiZafeELjF98BYu1Z6gH9x+n9Lh9fNfoNVPiG5i0l9IEyZLRECdSDsg/P9fhm2U3DFRJ6t7Q8wol9B7Tmxw72ldxtLHtzc0gcyMvNaorjdNHFsDuR8ivnsnfCfIrsz6zehPgvoqDp6JowcG2V1Wx2dk4ezBPIAunXopa87NYKQHs2B5kNfhJJOU4i86nuyWClaABhJgEEEiJg5GPCVt17pYKbGU+yw1WAZAkg6kkjU6eS1yx36fKd1WWpRNSzswVWEkgSC/c4m6GeY5Lm/4mAmrRgH/hn1cuqWk/w+INgQ8tGgxtcBn4E+ig6rw4p0vHxzv8O6ZFszBH9m/X+ldYbdjPYPq1AHOLXYBElsT7oOU7k7BRbHgGSpOx1G1cpkwGgH4S7tEdYPopF63PSK4Zpj201Jc0A9k4XA9YdkRvkt7i2yCjSq4PddSeWgZxIOQ6LNdNjaTacLe0yoxwmYiXAgzlELDaq7ZLWE4ROHpJkx0klW1nndcMbZ3fC7yK9Ci74XeRXamOWQdyzrbiPs3fCfIqVZcNpfGGkYgZnIadV1cYeQWSl2jAaXHkBKaOeXZwVWLgargwch2nH6Bdi/Dy5BRYXtbhaRhbzO5cSte5rkdVd2wWtGuWZ6dFeKbA0AAQBkAg9IiICIiAiIgIiICIiAiIgwWmyMqNLHNBadvtyVKv7h19KXMBfT83N7xuOqviIOOMptxYozIXm20S4ADmPmuj31wvSrdpn9nU5gZH+Zqqt5cNWmkJwio0Zy3WP5dUVFsYApOyWyGtafyPa8Hu27tVEirsja2QSVLNb1vtRqVC7notdeQ9fQ5B6Zss1NxBkahYXdFkY7mit6veLi0iAMXvEaugRn+9FoUyDlC+vIgr5ZxARMYqNnhzjzheqtEEgnZStgumtVJwtgfE7Ifr4Kx3XwwxnaqH2juX5R4boK9dFyVK5BjCzdx+nNXO77ppUmw1o6k5k+K3WiMgvqD41oGi+oiAiIgIiICIiAiIgIiICIiAiIgIiINW1XdRqe/Ta7vAnzULW4MsxJIL29A4QO6QrIiCn1+CPgrH+ps/JVi32J1Go9jjJaYnSdwV1dRl63HSrmXAhw/MMj480HPKFFzi1oHaJAHirPS4NdPbqiP7rfuVM3XcFKi7EJc7Yu27gpZBXKXB9ARL3nnmAD6KYs12UafuU2jrEnzK20QAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiD//2Q==', price: '₹790' },
      { id: 206, name: 'Ice Maker', image: 'https://m.media-amazon.com/images/I/41lR-T5h3iL._AC_UF1000,1000_QL80_.jpg', price: '₹2,200' },
      { id: 207, name: 'Water Filter', image: 'data:image/jpeg;base64,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', price: '₹420' },
      { id: 208, name: 'Defrost Heater', image: 'https://m.media-amazon.com/images/I/41AqLQ1KocL._AC_UF894,1000_QL80_.jpg', price: '₹340' },
      { id: 209, name: 'Temperature Sensor', image: 'data:image/jpeg;base64,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', price: '₹210' },
      { id: 210, name: 'Shelf', image: 'data:image/jpeg;base64,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', price: '₹680' }
    ]
  },
  {
    id: 3,
    name: 'Cooler',
    icon: '💨',
    imageUrl: 'https://ankurelectricals.com/cdn/shop/files/2_3ad158ec-d84a-419e-b26e-eae172407f2e.png?v=1740292857',
    productCount: 10,
    color: 'bg-green-50',
    spareParts: [
      { id: 301, name: 'Cooler Motor', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Motor', price: '₹950' },
      { id: 302, name: 'Water Pump', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Pump', price: '₹320' },
      { id: 303, name: 'Cooler Pad', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Pad', price: '₹180' },
      { id: 304, name: 'Float Valve', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Float+Valve', price: '₹95' },
      { id: 305, name: 'Fan Blade', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Fan+Blade', price: '₹140' },
      { id: 306, name: 'Air Distributor', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Distributor', price: '₹220' },
      { id: 307, name: 'Body Wheel', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Wheel', price: '₹160' },
      { id: 308, name: 'Drain Plug', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Drain+Plug', price: '₹45' },
      { id: 309, name: 'Water Tank', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Water+Tank', price: '₹380' },
      { id: 310, name: 'Control Switch', image: 'https://via.placeholder.com/100/43a047/ffffff?text=Switch', price: '₹85' }
    ]
  },
  {
    id: 4,
    name: 'Heater',
    icon: '🔥',
    imageUrl: 'https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Appliances/GHRGHAIK120.jpg',
    productCount: 10,
    color: 'bg-orange-50',
    spareParts: [
      { id: 401, name: 'Heating Element', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Heating+Element', price: '₹420' },
      { id: 402, name: 'Thermostat', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Thermostat', price: '₹190' },
      { id: 403, name: 'Temperature Control', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Temp+Control', price: '₹260' },
      { id: 404, name: 'Fan Motor', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Fan+Motor', price: '₹550' },
      { id: 405, name: 'Safety Thermostat', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Safety+Thermostat', price: '₹140' },
      { id: 406, name: 'Power Cord', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Power+Cord', price: '₹110' },
      { id: 407, name: 'Indicator Light', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Indicator+Light', price: '₹45' },
      { id: 408, name: 'Housing', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Housing', price: '₹320' },
      { id: 409, name: 'Handle', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Handle', price: '₹85' },
      { id: 410, name: 'Radiator Fins', image: 'https://via.placeholder.com/100/f57c00/ffffff?text=Radiator+Fins', price: '₹190' }
    ]
  },
  {
    id: 5,
    name: 'Washing Machine',
    icon: '🧺',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTatw7NgSRxxvBWXd5Yl_p4L3cPA180nzqY2g&s',
    productCount: 10,
    color: 'bg-purple-50',
    spareParts: [
      { id: 501, name: 'Wash Motor', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Wash+Motor', price: '₹1,950' },
      { id: 502, name: 'Drain Pump', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Drain+Pump', price: '₹720' },
      { id: 503, name: 'Door Lock', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Door+Lock', price: '₹380' },
      { id: 504, name: 'Inlet Valve', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Inlet+Valve', price: '₹240' },
      { id: 505, name: 'Timer', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Timer', price: '₹450' },
      { id: 506, name: 'Control Board', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Control+Board', price: '₹1,250' },
      { id: 507, name: 'Belt', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Belt', price: '₹180' },
      { id: 508, name: 'Shock Absorber', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Shock+Absorber', price: '₹320' },
      { id: 509, name: 'Drum Bearings', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Drum+Bearings', price: '₹290' },
      { id: 510, name: 'Water Level Sensor', image: 'https://via.placeholder.com/100/7b1fa2/ffffff?text=Level+Sensor', price: '₹160' }
    ]
  },
  {
    id: 6,
    name: 'Microwave',
    icon: '🔥',
    imageUrl: 'https://mahajanelectronics.com/cdn/shop/files/MJ2887BWUMuper.jpg?v=1770692450&width=1500',
    productCount: 10,
    color: 'bg-yellow-50',
    spareParts: [
      { id: 601, name: 'Magnetron', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Magnetron', price: '₹1,850' },
      { id: 602, name: 'High Voltage Diode', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Diode', price: '₹120' },
      { id: 603, name: 'Capacitor', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Capacitor', price: '₹210' },
      { id: 604, name: 'Turntable Motor', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Turntable+Motor', price: '₹320' },
      { id: 605, name: 'Door Switch', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Door+Switch', price: '₹85' },
      { id: 606, name: 'Control Panel', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Control+Panel', price: '₹540' },
      { id: 607, name: 'Waveguide Cover', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Waveguide+Cover', price: '₹95' },
      { id: 608, name: 'Stirrer Motor', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Stirrer+Motor', price: '₹280' },
      { id: 609, name: 'Thermal Protector', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Thermal+Protector', price: '₹110' },
      { id: 610, name: 'Power Cord', image: 'https://via.placeholder.com/100/fbc02d/000000?text=Power+Cord', price: '₹130' }
    ]
  },
  {
    id: 7,
    name: 'Dishwasher',
    icon: '🍽️',
    imageUrl: 'data:image/jpeg;base64,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',
    productCount: 10,
    color: 'bg-indigo-50',
    spareParts: [
      { id: 701, name: 'Wash Arm', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Wash+Arm', price: '₹480' },
      { id: 702, name: 'Drain Pump', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Drain+Pump', price: '₹680' },
      { id: 703, name: 'Detergent Dispenser', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Dispenser', price: '₹320' },
      { id: 704, name: 'Inlet Valve', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Inlet+Valve', price: '₹210' },
      { id: 705, name: 'Heating Element', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Heating+Element', price: '₹390' },
      { id: 706, name: 'Control Board', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Control+Board', price: '₹1,150' },
      { id: 707, name: 'Door Seal', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Door+Seal', price: '₹280' },
      { id: 708, name: 'Rack Wheel', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Rack+Wheel', price: '₹95' },
      { id: 709, name: 'Float Switch', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Float+Switch', price: '₹140' },
      { id: 710, name: 'Spray Nozzle', image: 'https://via.placeholder.com/100/3f51b5/ffffff?text=Spray+Nozzle', price: '₹75' }
    ]
  },
  {
    id: 8,
    name: 'Water Purifier',
    icon: '💧',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_IJLw645hxNPf_i29znb-JwA7IibY01iQXQ&s',
    productCount: 10,
    color: 'bg-blue-50',
    spareParts: [
      { id: 801, name: 'RO Membrane', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=RO+Membrane', price: '₹890' },
      { id: 802, name: 'UV Lamp', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=UV+Lamp', price: '₹420' },
      { id: 803, name: 'Carbon Filter', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Carbon+Filter', price: '₹260' },
      { id: 804, name: 'Sediment Filter', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Sediment+Filter', price: '₹180' },
      { id: 805, name: 'Booster Pump', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Booster+Pump', price: '₹1,250' },
      { id: 806, name: 'Flow Restrictor', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Flow+Restrictor', price: '₹95' },
      { id: 807, name: 'Storage Tank', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Storage+Tank', price: '₹680' },
      { id: 808, name: 'Faucet', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Faucet', price: '₹150' },
      { id: 809, name: 'Tubing', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Tubing', price: '₹40' },
      { id: 810, name: 'Connectors', image: 'https://via.placeholder.com/100/1976d2/ffffff?text=Connectors', price: '₹30' }
    ]
  },
  {
    id: 9,
    name: 'Vacuum Cleaner',
    icon: '🧹',
    imageUrl: 'https://www.rasoishop.com/cdn/shop/products/8901365426547-1.jpg?v=1645526943',
    productCount: 10,
    color: 'bg-gray-50',
    spareParts: [
      { id: 901, name: 'Suction Motor', image: 'https://via.placeholder.com/100/757575/ffffff?text=Suction+Motor', price: '₹1,450' },
      { id: 902, name: 'Filter', image: 'https://via.placeholder.com/100/757575/ffffff?text=Filter', price: '₹220' },
      { id: 903, name: 'Brush Roll', image: 'https://via.placeholder.com/100/757575/ffffff?text=Brush+Roll', price: '₹310' },
      { id: 904, name: 'Belt', image: 'https://via.placeholder.com/100/757575/ffffff?text=Belt', price: '₹85' },
      { id: 905, name: 'Dust Cup', image: 'https://via.placeholder.com/100/757575/ffffff?text=Dust+Cup', price: '₹270' },
      { id: 906, name: 'Hose', image: 'https://via.placeholder.com/100/757575/ffffff?text=Hose', price: '₹190' },
      { id: 907, name: 'Extension Wand', image: 'https://via.placeholder.com/100/757575/ffffff?text=Extension+Wand', price: '₹150' },
      { id: 908, name: 'Floor Head', image: 'https://via.placeholder.com/100/757575/ffffff?text=Floor+Head', price: '₹230' },
      { id: 909, name: 'Power Cord', image: 'https://via.placeholder.com/100/757575/ffffff?text=Power+Cord', price: '₹120' },
      { id: 910, name: 'Battery', image: 'https://via.placeholder.com/100/757575/ffffff?text=Battery', price: '₹680' }
    ]
  },
  {
    id: 10,
    name: 'Fan',
    icon: '🌀',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6g4Sb_IIYSYVS1LmbuNxHnDCJQr3uTSNH2w&s',
    productCount: 10,
    color: 'bg-teal-50',
    spareParts: [
      { id: 1001, name: 'Motor', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Motor', price: '₹520' },
      { id: 1002, name: 'Fan Blade', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Fan+Blade', price: '₹180' },
      { id: 1003, name: 'Oscillation Mechanism', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Oscillation', price: '₹140' },
      { id: 1004, name: 'Speed Regulator', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Speed+Regulator', price: '₹95' },
      { id: 1005, name: 'Capacitor', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Capacitor', price: '₹65' },
      { id: 1006, name: 'Canopy', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Canopy', price: '₹110' },
      { id: 1007, name: 'Down Rod', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Down+Rod', price: '₹130' },
      { id: 1008, name: 'Remote Control', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Remote', price: '₹210' },
      { id: 1009, name: 'Blade Holder', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Blade+Holder', price: '₹75' },
      { id: 1010, name: 'Switch', image: 'https://via.placeholder.com/100/00796b/ffffff?text=Switch', price: '₹45' }
    ]
  },
  {
    id: 11,
    name: 'Iron',
    icon: '👕',
    imageUrl: 'https://m.media-amazon.com/images/I/61YaUkzkEtL._AC_SL400_.jpg',
    productCount: 10,
    color: 'bg-red-50',
    spareParts: [
      { id: 1101, name: 'Sole Plate', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Sole+Plate', price: '₹190' },
      { id: 1102, name: 'Heating Element', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Heating+Element', price: '₹150' },
      { id: 1103, name: 'Thermostat', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Thermostat', price: '₹85' },
      { id: 1104, name: 'Water Tank', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Water+Tank', price: '₹110' },
      { id: 1105, name: 'Steam Valve', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Steam+Valve', price: '₹65' },
      { id: 1106, name: 'Power Cord', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Power+Cord', price: '₹95' },
      { id: 1107, name: 'Temperature Dial', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Temperature+Dial', price: '₹45' },
      { id: 1108, name: 'Handle', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Handle', price: '₹70' },
      { id: 1109, name: 'Spray Nozzle', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Spray+Nozzle', price: '₹35' },
      { id: 1110, name: 'Anti-drip System', image: 'https://via.placeholder.com/100/c62828/ffffff?text=Anti-drip', price: '₹55' }
    ]
  },
  {
    id: 12,
    name: 'Toaster',
    icon: '🍞',
    imageUrl: 'https://m.media-amazon.com/images/I/618Bkac5n-L.jpg',
    productCount: 10,
    color: 'bg-amber-50',
    spareParts: [
      { id: 1201, name: 'Heating Element', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Heating+Element', price: '₹120' },
      { id: 1202, name: 'Timer Mechanism', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Timer', price: '₹95' },
      { id: 1203, name: 'Carriage Lever', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Carriage+Lever', price: '₹65' },
      { id: 1204, name: 'Thermostat', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Thermostat', price: '₹80' },
      { id: 1205, name: 'Crumb Tray', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Crumb+Tray', price: '₹45' },
      { id: 1206, name: 'Casing', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Casing', price: '₹150' },
      { id: 1207, name: 'Power Cord', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Power+Cord', price: '₹85' },
      { id: 1208, name: 'Indicator Light', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Indicator+Light', price: '₹30' },
      { id: 1209, name: 'Browning Control', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Browning+Control', price: '₹70' },
      { id: 1210, name: 'Solenoid', image: 'https://via.placeholder.com/100/ff8f00/000000?text=Solenoid', price: '₹110' }
    ]
  }
];

const Parts = () => {

  const navigation = useNavigation();

  const handleSelectProduct = (product) => {
    navigation.navigate('SparePartScreen', { product })
  }
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      className="flex-1 m-1.5 "
      onPress={() => handleSelectProduct(item)}
    >
      <View className={`bg-white rounded-2xl p-3 items-center  border-gray-300 border  `}>
        <View className="w-full h-20  bg-white overflow-hidden mb-2 ">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
        <Text className="text-sm font-semibold text-gray-800 text-center" numberOfLines={1}>
          {item.name}
        </Text>

      </View>
    </TouchableOpacity>
  );

    const insets = useSafeAreaInsets();

  return (
    <View className='flex-1 bg-white '
        style={{ paddingTop: insets.top, paddingBottom: 12 }}

    >
       <StatusBar backgroundColor={'transparent'} barStyle={'dark-content'} translucent={true} />
      <Header
        title="Spare Parts"
        titleStyle={'text-2xl font-bold'}
        showBackButton={false}
        titlePosition="left"
        containerStyle="bg-white flex-row items-center justify-between px-4 py-5 border-b border-gray-200"
      />

      <View className="flex-1 bg-gray-50">
        {/* Header Stats */}


        {/* Categories Grid */}
        <FlatList
          data={categoryData}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id.toString()}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 6 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      </View>
    </View>
  )
}

export default Parts

const styles = StyleSheet.create({})