// service-worker.js

self.addEventListener('push', (event) => {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAMAAzAMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABgcBBQIDBAj/xABAEAABAwMCAwUFAwoGAwEAAAABAAIDBAURBiESMWEHE0FRcSIygZGhFLHBFSMzQlJigpLR8BYlQ3KiwiRTVBf/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAwQFAQIG/8QAJhEAAgIBBAICAQUAAAAAAAAAAAECAxEEEiExIkEFExQjMnGBwf/aAAwDAQACEQMRAD8AvFERAEREAREQBERAEREAWDshKrLtE7R5bZUvsmnGsmufKWcjibT9Mci712HiuN4BZufJYB6r5onpLvcJDPdL7WyVRPECJnHgPTfb4YCmPZ5re52y8xWDUtU+pp6jakqpnFzmnwaXcyD13B6LxG2MnhEMNRXN4iy6EWGlZUhMEREAREQBERAEREAREQBERAEREAREQBFgqO6n1nYtMMzda0NlIy2njHHI7+EeHU4HVASNYyqgn7TtS3pzm6U03IyLOBPVe0ceZGzW/Mryvo+0e6HNdqKnomO/VhOT8mjH/JRythHtkcrYQ7ZNO1PVT9M6dd9kkLbjWEw0xAzwZ5vx0HLrhVBZreKOEyS5fVTe1I9xycnfn96kM3Z5XVkjJblqaeokYcteYOLh9MvK7Hdn9YN49ST5/epgf+yrW3RnwmUdVdC2O2MsGqWs1FTumt5miJbNTnvGOHMef9fgFv59GalpxmmuVBVt8pWOjJ+h+9amvhvNuikbdrLOI+EgzUxErcH0/qoYRxLKZSpplCxSg0y8NC3n8v6Vt1xJHeSwgSgeDxs4fMFb9U72H6ot1JaqiyXCvhgqRVOfTRyO4eNrgDgE7Z4uLbnurfa4EbHK0l0b5zReepqqelYX1M8cLBuXSODR9VqYtX6amnbBDqC2STOOBG2qYST5Yyug3yLgx4c0OaQQRsQchc0AREQBERAEREAREQBEQoAuuZ7Y2l73BrWjJJOAPiuTvmqe7QNR1uqby7SOnX8MAJFfUeAA5j0Hl4nbzXlyS7ONpLLO7UnaFcb7WyWXQcZl5iW4fqgeJaTyH73j4ZXVYdB0FC41V1e65XB7uJ8s24z0H9VvbHZqOyW9tJRMw3m959+R37Titgs23UOXETJv1kpvEeg0BrQ1oAaBgADACwsoqxRfIREXBlgrAysogXHRH7/o+z3yNxqKVsUzv9aEBrvj4FRauqtb6IoJaejuD6u1v2ZVOZxupx8d2/UfcrJRzQ5pDgCCMEEbEKxXqJw4zwWqdVOvjPBS35PfewKy7XOa5PdvlzyW56Z5fABd0lhtz4yx0TuntEqRap0tLaXy3ewRkw+9U0Tc8v2mf0C1VHUxVlOyaFwc1w8PDopJTk/JPg5fdcvOMuCR9jt7q6C+VGlqyd8tOYzJScX6mPAdCPDwV0Kg+z2N0/apAWA4hpXFxH+0H/sFfavVtuKbNiqTlBNmURFISBERAEREAREQBYKyuL842QEN7VNUO01piV1K4Cvq8w0x8WEjd49B9cKN6F0+2wWZoe3FZUfnKh597Pg34fetdqV41X2sx0pPFRWRge4Y2LxuB/MW/BpCmgydznfzVDWWdRRna+3GIIIiKgZQREQ6EREOBERAEREA3yMbdQq31fZhp+4C7UUeLdUPDamJg2ief1gPIqyF0V1LDX0c1HVMD4Zmlrx0Kkrntlj0S0zUXh9MjPYZb3VNVeL/ACt/SP7iIn+Y/ThCuFVL2O3GS1XK66QrX5fTzOlp87ZB3dj1BDvirZzy6rYhjbwb8cbVt6OSIi9HoIiIAiIgCIiALpq5RT00szjhsbC4n0GV3LQa/qHUuib5Ow4cyhl4T14SAgKu7K2vrIbtfJv0lfVkgn9n3sfAuPyU73x5qL9msAp9G0YHNxe/1ySu7WOqYtNUrPYE1XNkRRZwAPFx6fesm1OdrwYl0ZW3tIkSKn4e0q/MmL5GUj2Z/R91gfPn8VZemr7Tahtba2laY8OLJYnc43jmOo3BB69F5nTKCyzzbpbKllm1REUJWCIiAJnohIAJccAbk+QVX6g7SaoVkkNkjiZBG4t7+RvE6THMgeA+vpyUkKpT6JqaJ3PES0EVc6U7RJqquior2yJvfHhZURjHC48uIeR5dFY2emEnW4PkXUTqe2QTCIvBCV5r9tdZtTWq/wBnkENVK005fwgguHLOdjkEj4BbC09rd2t0zYdVWqOSEnH2mjBaR1LSSHfAj0K7u06POme/xk01THI0+W+D9CozK1j4HCYAxlvtB3JXq7moo0oatwhD2i/LXc6S60MNbQTMmp5hxMe08wvYqq7AXzust0YS77GysxT56tBdj6H1JVqK8nlGoZREXQEREAREQBRTtSyez6+4/wDld+Cla0GvoHVOir5CxvE99DKGjrwnCAhGhXMbo22uJAaIPayeSgPanIJ73S1DC50Bg4GuLdsg7qW6JLqzQdJ3OSY3OBHmGkrruFvpbhTGmrGBzTuM7OafMLNjiNjbJfjvjqrt9m7yz0VHn6clZ/ZBDM2huU8me5klYxh8y0HP3hcLX2bUE7u9qaqq7nO0ezeL44zhT+hpKegpI6WihbDTxjDI28gu3Wx24RnfIXKOavZ3+OPHyTPMePhlaPVGnzfoIWxV9RRywOLmOiJxk4HtAen95UeFs7QaD2KW60dZGORnwD934qvGtNdmbCmMo53YJ7unIkKBGi7RKvDZrhQUjP1nROGflwn71uNLaXqbPVS11fdaiuqpmcDuMkN+RJ3XXVFLs7KiMY53G6u8ck1qrIoc94+F7W488L54LXNPC/3m+yfUc19JHkojqLQdru88lXG+Skqnbu7nHC8+hG2V709qjwyxoNRGuW2XsqCmY+SpibGCXue0Nx552X0LRVMc0LQ2TLmAB2R4qBWjTFFZpzI4SS1LNuOXHs+gUpssTnVZl37trcZ8CvV8lNcG9rfja3pHbOWGujeBEHVFUPkCM9pJxo6uJI34BjzPEFBbRQXPWVay22WNzaVuBVVbx7LB1/Acz8CpV2t1BZphlNHnvamoY1gHMkb/AIAK1tPWuntVmo6OmgZEyONuQxuMuxuT1Wjpq04Js19HVGVabGmrHSads9PbaBuIoRu483u8XHqStqsYCyrpfCIiAIiIAiIgC6a2EVFJNA4AiRhYQeowu5Ydu3CApLsokNPbbhaJXfnqCrc0g8wOWf5g5TfgaTktaT5kKGawgfovtDZeQ1wtV3HBUFvJrtsn1GAfTi81NGuY9odG4FjhlpByCPNZephtnkyNXGddm6L7MoiKqUWOfNERAERF04ZWERcBhzGuxxNBxyyOSyNhgcvJEXT25yaw2ERa+/XWnslqmr6k+zGPZbn33eAC6k5PCORi21FEC7QbxT/4wtcVQ2Saitb2TVLIxk8RIdj1ADfmr0tVwprpQQVtDKJKadvHG9p2IXzzQ08lRHUVFxHeVNc8yz8XPfcD++SlvYhXz0d8u+n3yufShn2iEE7RuBAdjyyHA/DqtOiSXgvRs6W2Es1x9FzoiKyWwiIgCIiAIiIAsFZRAabVWn6PUtlntleCGSbskb70TxycPT68vFVJarpX6Jr/APDuqxilBIpa0e7w+G/7P3K8yCVqNR6dtuoqB1HdKYSxn3XA4dGfNp8CvFlcZrDPFlcbFiRoWPbI0PY4OYRlpacjCyoPV6d1doJ732v/ADqzAkiPB42Dq0e76tyOgXvsmvbJcyIppjb6ri4XRVW2/R/I+hweizbNNKJkW6OcOuUSlFhrg8Atc0g+LTkLPn0VdpoqPKeGETKLgCIiHAmQuuonhp4nS1EscMTfefI4NaPUlRC69oFGyRtJYKeW61jzhoiae7B9cZd/Dt1CkhVOT4Ja6LJvxRKLpcqO1UklXcJ2xQsG+eZ6AeJ6Kp7vd7vqWvir22irmt8ZJpYGNPD/ALnHBBd6bBTmw9nd31HVsumvJyIhvFbmEDbydjZo6DJ8z4K2aanipYGQU0TYoYxwsYwYDR5ALQq0yj2a1GljWsy7Pnmmtesrq/goLA+nDv8AUmGA34nAHyVodmuhH6WbU1tyqRU3SrAa9zPciYN+EE7kk7k9APDJnQys4U8a4x6J4VQr/asGURF7JAiIgCIiAIiIAiIgCIiA4keSjeotD6d1BxvuNBGJiN54vYeB6hSZR3X90Nm0jdK1pAe2AtZnxc7YD5lcYKV0tZqqsvV3hsF3raG3UTyyGQnj4znYFvLkCfkpT9l1xRYEVZa7i0f+1jonH7x9Vw7PRSWfTVvp6mpijq7jxVDWSPDXSDIxz57cK3uorS+7W77PFVTUc0TxJFLG4jDxyz5jdZ1k/PlcGTda/tw0sfwaX8s6yiH57S8Mw84Kxm/zdlDqHVPho2bPWpZ/Ve7SV5qbjHUUN0j4LpQOEc+OTxjZ49cLeVMsdPTyzzHEcTC9x8gBleJS2vG1Ecmoy27ERX8ra0nP5nTdJBtzmq2H7nFPsGtq4kVd2t9vYfCli7xwHqcLjpxtw1FWR6jrp5oKIOf9hoWOIHDkjjf5kqUVlbSUQjdW1UUPG4NZ3rwMk+A812UtjxFHZz2PbGKKlvFs+y3+ppL/AFk1Y2KMTQy1EhwW75OOQPp5KadglLJ3t6rI48URexkL3N9ovGc78+XCtX2uW0S0VFdIx7UUncS8P7Lvd/5DH8S3nZtrxgq6LTFdaGW4vaW0zoTlryBnfqQCc+at0PK3Ghpnujuz/RbLRtyXJYbyWVZLIREQBERAEREAREQBERAEREAREQBVh29VLxpqht8bsOrq5jD6AF33gKziqZ7X5qq762s1kt8bHTUcX2od47DXOcds+gYf5l5l0cfRy1A/SBZSWW/vgErImtjHJ0WQP1hy8Nl1/wCG6+3vjgtGsJqdjxmKCpLJTj9zOT8k01YairOoJdT0EYluErW8OQ4cIB93pk/QeS857O6OCz1pkqZam4BhNLUl7sxcOSwAZ365+GNlRzHrJmuUVLbu/wBJDpywOtDqqoqqyWtrqtwM9RIMcWOQAHktvU08dVTS08zeKOVhY4eYIwtVo+5vu+mqCskOZHR8L3fvDYrdAZIHmVVnKW/llKyUvs57ITFpi726KOio9WvpaIHhhikjZxgeQJ/BdbLZpaw3WJ9+uTq26vwQ+vkL3N8tvDplea1Wan1rVXi53Z0r42zupqFrZC0QsbyIx6g+WSdlsINE09Hp66RVIFwuVVG7NRIOJ3L2QCeXLPr6DFlyS4ky65peM5cm81TQtuunbhSgB7pacmM8xxDdp+YCqDSt+dar1BfJ6J9wdSszE3jLRHtji5eAJx8/BTq03u/2iOz0V+tkUdLUFtIyVsmZQ7h2Lhy8Fp9MaNhu9BWTw3Cpo5m1ksOIyCwta4gDHpsvda+uPPRLR+jBuT4LtsOpbdd7DBd452Q08owe+eG8DvFpzstwyVsjQ5hDmnkWnIK+b7voO8W+Fp4nXC3wcTu6hkLSwHmQw5HyVh9glbNUaarIJJeOOCpAiGfdaW5x0VqNil0W4WRmsxZaCLA5LKkPYREQBERAEREAREQBERAEREAKqXteo5rRqG0aupojJHEBTVQHgMktPx4nD14VbS8V1t9NdKGeirYhJTzMLXtPiFxrKwcaysFa3i9VMdNSVts7t9FKzi7zh4gT5HyC89kr6k09yrq2dzqWKMuJedg4bnHlt968E2mtW6Imljs1L+W7JI4lsW7nMz4FvMHqMg9FrrnHrLUdtdR0OlpqKhaeKSJvs97vyy7GfQDKofjSUuDK/AmrcrpEk7NoJINGUAlHC9/FJjo4qTtOHA+RyoBHrC8WqGOC56Pq6dkTQxvdFw2HLYt/Fc//ANMpgN7DduIeHA0/io50WOTeDzZprvsbSOGi3z02l7vRU7iysoq6VsmPeHIH4+yV7rNe7rPUwU7QycA7kty7hJ5kqMjUFe7Ucl109Y69pqmf+XTSxFzZSNuLbkcf3zW1irdW3ZrqGwaVfbHTHEtQ/IDOvEQMfUqSdE5Szg9W6Kc7NyPJrq+/aNTUFHQxmpdQOc5rG7h9QQA3PRu2fUqV6chotM2GClrK+BsjQZJnyyjd7jk7/FeG39iT/Zlr9RTNnO7vssGMeftOJJ9cBbqj7F9MROD6yWvrHDn3s3Dn+UBTyozHay7LTJwUM8Gju3aFbYD3FnY+41zv0bImngz1OMken05qSdkOma+wWirqbs3u6yvlErocAFg6gbA7nZSmx6Ysljb/AJVbaand+2xntH1PNbjAUlVUa+iSqmNSxEyiIpSUIiIAiIgCIiAIiIAiIgCIiALCyiAxhFlEBxXExMJyWMz58K7EQHEDAwOSysogMBZREAREQBERAEREAREQBERAf//Z', // укажите путь к иконке уведомления
        badge: data:image/jpeg;base64,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' // укажите путь к значку уведомления
    });
});
